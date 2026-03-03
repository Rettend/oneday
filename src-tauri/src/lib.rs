use serde::Serialize;
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{Emitter, Manager, State};
use tauri_plugin_deep_link::DeepLinkExt;
use x_win::WindowInfo;

const TRACKER_POLL_SECONDS: u64 = 5;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TrackedActivityEntry {
    sequence: u64,
    timestamp: i64,
    app_name: String,
    window_title: String,
    browser_url: Option<String>,
    is_idle: bool,
}

#[derive(Default)]
struct ActivityTrackerBuffer {
    next_sequence: u64,
    pending: Vec<TrackedActivityEntry>,
    current: Option<TrackedActivityEntry>,
}

#[derive(Default)]
struct ActivityTrackerState {
    inner: Mutex<ActivityTrackerBuffer>,
}

impl ActivityTrackerState {
    fn push_sample(&self, mut entry: TrackedActivityEntry) {
        if let Ok(mut state) = self.inner.lock() {
            state.next_sequence = state.next_sequence.saturating_add(1);
            entry.sequence = state.next_sequence;

            state.current = Some(entry.clone());
            state.pending.push(entry);
        }
    }

    fn current(&self) -> Option<TrackedActivityEntry> {
        self.inner
            .lock()
            .ok()
            .and_then(|state| state.current.clone())
    }

    fn pending(&self, limit: Option<usize>) -> Vec<TrackedActivityEntry> {
        let Some(state) = self.inner.lock().ok() else {
            return Vec::new();
        };

        let take = limit
            .unwrap_or(state.pending.len())
            .min(state.pending.len());

        state.pending.iter().take(take).cloned().collect()
    }

    fn acknowledge_through(&self, up_to_sequence: u64) -> usize {
        let Some(mut state) = self.inner.lock().ok() else {
            return 0;
        };

        let before = state.pending.len();
        state
            .pending
            .retain(|entry| entry.sequence > up_to_sequence);
        before.saturating_sub(state.pending.len())
    }
}

fn normalize_non_empty(value: String, fallback: &str) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        fallback.to_owned()
    } else {
        trimmed.to_owned()
    }
}

fn normalize_optional(value: String) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_owned())
    }
}

fn is_browser_process(app_name: &str) -> bool {
    let normalized = app_name.trim().to_lowercase();
    [
        "chrome", "chromium", "firefox", "safari", "edge", "brave", "opera", "vivaldi", "arc",
        "browser",
    ]
    .iter()
    .any(|token| normalized.contains(token))
}

fn current_unix_ms() -> i64 {
    let now = SystemTime::now();
    let Ok(since_epoch) = now.duration_since(UNIX_EPOCH) else {
        return 0;
    };

    i64::try_from(since_epoch.as_millis()).unwrap_or(i64::MAX)
}

fn map_window(window: WindowInfo) -> TrackedActivityEntry {
    let app_name = normalize_non_empty(window.info.name.clone(), "Unknown app");
    let browser_url = if is_browser_process(&app_name) {
        x_win::get_browser_url(&window)
            .ok()
            .and_then(normalize_optional)
    } else {
        None
    };

    let window_title = normalize_non_empty(window.title, "Untitled window");

    TrackedActivityEntry {
        sequence: 0,
        timestamp: current_unix_ms(),
        app_name,
        window_title,
        browser_url,
        is_idle: false,
    }
}

fn poll_active_window() -> Option<TrackedActivityEntry> {
    x_win::get_active_window().ok().map(map_window)
}

fn spawn_tracker_thread(app: tauri::AppHandle) {
    std::thread::spawn(move || loop {
        if let Some(entry) = poll_active_window() {
            let state = app.state::<ActivityTrackerState>();
            state.push_sample(entry);
        }

        std::thread::sleep(Duration::from_secs(TRACKER_POLL_SECONDS));
    });
}

#[tauri::command]
fn tracker_get_current_activity(
    state: State<'_, ActivityTrackerState>,
) -> Option<TrackedActivityEntry> {
    state.current()
}

#[tauri::command]
fn tracker_get_pending_activity(
    state: State<'_, ActivityTrackerState>,
    limit: Option<u32>,
) -> Vec<TrackedActivityEntry> {
    let parsed_limit = limit.and_then(|value| usize::try_from(value).ok());
    state.pending(parsed_limit)
}

#[tauri::command]
fn tracker_ack_pending_activity(
    state: State<'_, ActivityTrackerState>,
    up_to_sequence: u64,
) -> usize {
    state.acknowledge_through(up_to_sequence)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .manage(ActivityTrackerState::default())
        .plugin(tauri_plugin_notification::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }));
    }

    builder
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(any(windows, target_os = "linux"))]
            #[cfg(debug_assertions)]
            {
                let _ = app.deep_link().register_all();
            }

            let handle = app.handle().clone();
            let handle_for_events = handle.clone();
            handle.deep_link().on_open_url(move |event| {
                if let Some(window) = handle_for_events.get_webview_window("main") {
                    if let Some(url) = event.urls().first() {
                        let _ = window.emit("deep-link", url.to_string());
                    }

                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            });

            spawn_tracker_thread(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            tracker_get_current_activity,
            tracker_get_pending_activity,
            tracker_ack_pending_activity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
