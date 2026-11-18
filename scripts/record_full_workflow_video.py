import os
import sys
import time
import math
import subprocess
from pydub import AudioSegment
from playwright.sync_api import sync_playwright

def prepare_narration():
    print("Preparing narration audio tracks...")
    os.makedirs("video_assets/audio", exist_ok=True)
    
    scenes = [f"scene{i}" for i in range(1, 7)]
    segments = []
    timings = []
    current_time = 0.0
    
    silence_gap = AudioSegment.silent(duration=800) # 800ms gap
    
    for i, sc in enumerate(scenes):
        path = f"video_assets/audio/{sc}.mp3"
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing {path}")
        seg = AudioSegment.from_file(path)
        start = current_time
        duration = len(seg) / 1000.0
        end = start + duration
        timings.append({
            "scene": sc,
            "start": start,
            "duration": duration,
            "end": end
        })
        segments.append(seg)
        if i < len(scenes) - 1:
            segments.append(silence_gap)
            current_time = end + 0.8
        else:
            current_time = end
            
    # Trailing silence
    segments.append(AudioSegment.silent(duration=2500))
    current_time += 2.5
    
    full_audio = segments[0]
    for seg in segments[1:]:
        full_audio = full_audio + seg
        
    full_audio_path = "video_assets/audio/full_narration.mp3"
    full_audio.export(full_audio_path, format="mp3")
    print(f"Full audio exported to {full_audio_path}, total length: {len(full_audio)/1000.0:.2f}s")
    for t in timings:
        print(f"  {t['scene']}: {t['start']:.2f}s -> {t['end']:.2f}s (duration: {t['duration']:.2f}s)")
    return timings, current_time

def record_video(timings, total_duration):
    os.makedirs("video_assets/recordings", exist_ok=True)
    print("Starting Playwright Chromium browser recording...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-web-security", "--hide-scrollbars"]
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir="video_assets/recordings",
            record_video_size={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        page.goto("http://127.0.0.1:4173")
        page.wait_for_timeout(2000)
        
        # Inject custom styling, animated cursor, and HUD overlay
        page.evaluate("""() => {
            // Virtual Cursor
            const cursor = document.createElement('div');
            cursor.id = 'virtual-cursor';
            cursor.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: rgba(56, 189, 248, 0.95);
                border: 2.5px solid #ffffff;
                box-shadow: 0 0 18px rgba(56, 189, 248, 0.95), 0 2px 8px rgba(0,0,0,0.85);
                z-index: 9999999;
                pointer-events: none;
                transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), background 0.15s ease;
                transform: translate3d(960px, 540px, 0);
            `;
            document.body.appendChild(cursor);

            // Cursor Click Pulse Effect
            window.__showClickRipple = (x, y) => {
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: fixed;
                    top: ${y - 22}px;
                    left: ${x - 22}px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 2.5px solid #38bdf8;
                    box-shadow: 0 0 14px #38bdf8;
                    z-index: 9999998;
                    pointer-events: none;
                    animation: pulseRing 0.5s ease-out forwards;
                `;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);
            };

            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulseRing {
                    0% { transform: scale(0.3); opacity: 1; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
            `;
            document.head.appendChild(style);

            // Lower-Third HUD Banner
            const hud = document.createElement('div');
            hud.id = 'video-hud';
            hud.style.cssText = `
                position: fixed;
                bottom: 28px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 10, 12, 0.92);
                border: 1px solid rgba(56, 189, 248, 0.4);
                border-radius: 14px;
                padding: 12px 28px;
                z-index: 999999;
                backdrop-filter: blur(16px);
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.85), 0 0 20px rgba(56, 189, 248, 0.2);
                display: flex;
                align-items: center;
                gap: 18px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                pointer-events: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                min-width: 680px;
                max-width: 920px;
            `;
            hud.innerHTML = `
                <div style="width: 12px; height: 12px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 14px #38bdf8; flex-shrink: 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 3px; flex-grow: 1;">
                    <div id="hud-badge" style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;">SYSTEM INTRO</div>
                    <div id="hud-title" style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: -0.01em;">GST Credit-at-Risk Forecaster</div>
                    <div id="hud-subtitle" style="color: #94a3b8; font-size: 13px; font-weight: 400; line-height: 1.35;">Autonomous Rule 37A & Section 16(2)(aa) Decision Engine</div>
                </div>
            `;
            document.body.appendChild(hud);

            window.__setHud = (badge, title, subtitle) => {
                const b = document.getElementById('hud-badge');
                const t = document.getElementById('hud-title');
                const s = document.getElementById('hud-subtitle');
                if (b) b.innerText = badge;
                if (t) t.innerText = title;
                if (s) s.innerText = subtitle;
            };

            window.__moveCursor = (x, y) => {
                const c = document.getElementById('virtual-cursor');
                if (c) c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            };
        }""")

        def set_hud(badge, title, subtitle):
            page.evaluate(f"window.__setHud({repr(badge)}, {repr(title)}, {repr(subtitle)})")

        def move_to_element(selector, offset_x=0, offset_y=0, wait_ms=400):
            try:
                el = page.locator(selector).first
                if el.count() > 0 and el.is_visible():
                    box = el.bounding_box()
                    if box:
                        target_x = box["x"] + box["width"] / 2 + offset_x
                        target_y = box["y"] + box["height"] / 2 + offset_y
                        page.evaluate(f"window.__moveCursor({target_x}, {target_y})")
                        if wait_ms > 0:
                            page.wait_for_timeout(wait_ms)
                        return target_x, target_y
            except Exception as e:
                pass
            return 960, 540

        def click_element(selector, offset_x=0, offset_y=0, wait_ms=600):
            try:
                el = page.locator(selector).first
                if el.count() > 0 and el.is_visible():
                    box = el.bounding_box()
                    if box:
                        target_x = box["x"] + box["width"] / 2 + offset_x
                        target_y = box["y"] + box["height"] / 2 + offset_y
                        page.evaluate(f"window.__moveCursor({target_x}, {target_y})")
                        page.wait_for_timeout(250)
                        page.evaluate(f"window.__showClickRipple({target_x}, {target_y})")
                        el.click(timeout=3000)
                        if wait_ms > 0:
                            page.wait_for_timeout(wait_ms)
                        return True
            except Exception as e:
                print(f"Note: click_element on {selector} fallback: {e}")
            return False

        start_record_time = time.time()
        print(">>> Beginning Choreographed Scene Recording...")

        # -------------------------------------------------------------
        # SCENE 1: Introduction & Statutory Operating Context (~39s)
        # -------------------------------------------------------------
        print("Recording Scene 1...")
        set_hud(
            "PHASE 1 • STATUTORY RECONCILIATION CONTEXT",
            "Indian GST Mandates: Section 16(2)(aa) & Rule 37A",
            "Reconciling ERP Purchase Registers with GSTR-2B returns before the Nov 30 statutory cutoff"
        )
        click_element("button:has-text('Executive Pitch & Overview')", wait_ms=1000)
        move_to_element("h1, h2:has-text('GST Credit-at-Risk')", wait_ms=2500)
        
        # Smooth scroll through statutory problem
        page.evaluate("window.scrollTo({ top: 380, behavior: 'smooth' })")
        page.wait_for_timeout(4000)
        move_to_element("text=Statutory Milestones", wait_ms=2500)
        
        page.evaluate("window.scrollTo({ top: 760, behavior: 'smooth' })")
        page.wait_for_timeout(3500)
        move_to_element("text=Rule 37A", wait_ms=3000)
        move_to_element("text=18%", wait_ms=2500)
        
        page.evaluate("window.scrollTo({ top: 1100, behavior: 'smooth' })")
        page.wait_for_timeout(4000)
        move_to_element("text=Month-End AP Dilemma", wait_ms=3500)
        
        # Wait remainder of scene 1 duration
        rem_scene1 = timings[0]["end"] - (time.time() - start_record_time)
        if rem_scene1 > 0:
            page.wait_for_timeout(int(rem_scene1 * 1000))

        # -------------------------------------------------------------
        # SCENE 2: The 3-Signal Decision Architecture (~41s)
        # -------------------------------------------------------------
        print("Recording Scene 2...")
        set_hud(
            "PHASE 2 • 3-SIGNAL TRIAGE ENGINE",
            "Deterministic Operational Triage & LightGBM Forecaster",
            "Signal 1: IRN Registry (±20) • Signal 2: AP Retention Leverage • Signal 3: Vendor Periodicity"
        )
        page.evaluate("window.scrollTo({ top: 1450, behavior: 'smooth' })")
        page.wait_for_timeout(3000)
        
        move_to_element("text=Signal 1", wait_ms=3500)
        move_to_element("text=Signal 2", wait_ms=3500)
        move_to_element("text=Signal 3", wait_ms=3500)
        
        page.evaluate("window.scrollTo({ top: 1850, behavior: 'smooth' })")
        page.wait_for_timeout(3000)
        move_to_element("text=LightGBM", wait_ms=3500)
        move_to_element("text=Invariant Bounds", wait_ms=3000)
        
        # Open Commercial modal to show CA Economics
        click_element("button:has-text('CA Economics')", wait_ms=4500)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)
        
        # Scroll back to top
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(2000)

        rem_scene2 = timings[1]["end"] - (time.time() - start_record_time)
        if rem_scene2 > 0:
            page.wait_for_timeout(int(rem_scene2 * 1000))

        # -------------------------------------------------------------
        # SCENE 3: Live Triage Console & 1-Click Pipeline (~38s)
        # -------------------------------------------------------------
        print("Recording Scene 3...")
        set_hud(
            "PHASE 3 • 1-CLICK PIPELINE ROUTING",
            "Live Interactive Triage: Partitioning Mismatches into 3 Buckets",
            "Safe to Hold (75–100) • Watch (40–74) • Chase Now (0–39)"
        )
        click_element("button:has-text('Live Triage Console')", wait_ms=2000)
        move_to_element("text=Tax at Risk", wait_ms=2500)
        
        # Click Run Pipeline Routing
        click_element("button:has-text('Run Pipeline Routing')", wait_ms=4500)
        
        # Inspect KPI Cards
        move_to_element("text=SAFE TO HOLD", wait_ms=2500)
        move_to_element("text=WATCH", wait_ms=2000)
        move_to_element("text=CHASE NOW", wait_ms=2000)
        
        # Filter by SAFE TO HOLD
        click_element("button:has-text('SAFE TO HOLD')", wait_ms=3500)
        move_to_element("tbody tr", wait_ms=2500)
        
        # Filter by CHASE NOW
        click_element("button:has-text('CHASE NOW')", wait_ms=3500)
        move_to_element("tbody tr", wait_ms=2500)

        rem_scene3 = timings[2]["end"] - (time.time() - start_record_time)
        if rem_scene3 > 0:
            page.wait_for_timeout(int(rem_scene3 * 1000))

        # -------------------------------------------------------------
        # SCENE 4: Invoice Deep-Dive & Explainability (~29s)
        # -------------------------------------------------------------
        print("Recording Scene 4...")
        set_hud(
            "PHASE 4 • DETERMINISTIC EXPLAINABILITY",
            "Mathematical Score Breakdown & Statutory Rule 37A Cutoff",
            "LightGBM calibrated probability bounded by deterministic invariant clamps [0, 39]"
        )
        # Click the high-risk Chase Now invoice row
        click_element("tbody tr", wait_ms=2500)
        
        # Scroll detail drawer
        move_to_element("text=Score Breakdown", wait_ms=3000)
        move_to_element("text=IRN", wait_ms=2500)
        move_to_element("text=AP Leverage", wait_ms=2500)
        move_to_element("text=Rule 37A Cutoff", wait_ms=3000)
        
        # Close drawer
        page.keyboard.press("Escape")
        page.wait_for_timeout(1500)
        
        # Click Safe to Hold and inspect
        click_element("button:has-text('SAFE TO HOLD')", wait_ms=1500)
        click_element("tbody tr", wait_ms=2500)
        move_to_element("text=Unpaid Balance", wait_ms=2500)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)

        rem_scene4 = timings[3]["end"] - (time.time() - start_record_time)
        if rem_scene4 > 0:
            page.wait_for_timeout(int(rem_scene4 * 1000))

        # -------------------------------------------------------------
        # SCENE 5: AI Tax Copilot & External Portal Agent (~34s)
        # -------------------------------------------------------------
        print("Recording Scene 5...")
        set_hud(
            "PHASE 5 • AI TAX COPILOT & AUTONOMOUS AGENTS",
            "Multi-Provider Legal Grounding & TinyFish Web Agent",
            "Synthesizes Section 16(2)(aa) & Sec 50(1) interest notices • Automated GST Portal Checks"
        )
        # Open Copilot FAB
        click_element("button:has-text('Ask AI Copilot')", wait_ms=2000)
        
        # Click prompt chip
        chip = page.locator("button:has-text('Rule 37A Statutory Cutoff')")
        if chip.count() > 0:
            click_element("button:has-text('Rule 37A Statutory Cutoff')", wait_ms=5000)
        else:
            page.wait_for_timeout(4000)
            
        move_to_element("div:has-text('Section 16')", wait_ms=3000)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1500)
        
        # Open TinyFish modal
        click_element("button:has-text('Test Any GSTIN')", wait_ms=3000)
        move_to_element("text=GST Portal", wait_ms=2500)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)

        rem_scene5 = timings[4]["end"] - (time.time() - start_record_time)
        if rem_scene5 > 0:
            page.wait_for_timeout(int(rem_scene5 * 1000))

        # -------------------------------------------------------------
        # SCENE 6: ML Diagnostics, Audit & Executive Export (~30s)
        # -------------------------------------------------------------
        print("Recording Scene 6...")
        set_hud(
            "PHASE 6 • AUDIT READINESS & EXECUTIVE EXPORT",
            "Model Backtesting Diagnostics & One-Click Reporting",
            "ROC-AUC (0.914), Calibration Curves, CSV Ledgers & PowerPoint Deck Generation"
        )
        click_element("button:has-text('ML Diagnostics & Audit')", wait_ms=2500)
        move_to_element("text=Confusion Matrix", wait_ms=3000)
        move_to_element("text=ROC Curve", wait_ms=3000)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1500)
        
        # Export CSV
        click_element("button:has-text('Export CSV')", wait_ms=2500)
        
        # Showcase full dashboard overview
        click_element("button:has-text('ALL')", wait_ms=2000)
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        move_to_element("h1, h2:has-text('GST Credit-at-Risk')", wait_ms=3500)

        rem_scene6 = timings[5]["end"] - (time.time() - start_record_time)
        if rem_scene6 > 0:
            page.wait_for_timeout(int(rem_scene6 * 1000))
            
        # Final buffer
        page.wait_for_timeout(2500)
        
        print("Recording completed. Finalizing video file...")
        context.close()
        browser.close()
        raw_video_path = page.video.path()
        print(f"Raw video saved at: {raw_video_path}")
        return raw_video_path

def merge_video_and_audio(raw_video_path, audio_path, output_mp4):
    print("Combining video and audio with FFmpeg...")
    cmd = [
        "ffmpeg", "-y",
        "-i", raw_video_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_mp4
    ]
    print("Executing command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        raise RuntimeError("FFmpeg failed to merge video and audio")
    print(f"Final MP4 Video created successfully: {output_mp4} (size: {os.path.getsize(output_mp4)} bytes)")

def main():
    timings, total_duration = prepare_narration()
    raw_video = record_video(timings, total_duration)
    output_mp4 = os.path.abspath("GST_Credit_Workflow_Walkthrough.mp4")
    merge_video_and_audio(raw_video, "video_assets/audio/full_narration.mp3", output_mp4)
    print("\n=======================================================")
    print(f"SUCCESS: Video walkthrough generated at:\n{output_mp4}")
    print("=======================================================")

if __name__ == "__main__":
    main()
