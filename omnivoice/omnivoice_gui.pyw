#!/usr/bin/env python3
"""
OmniVoice GUI — Premium Edition
================================
A beautiful Windows GUI launcher for OmniVoice TTS.
Uses only Python standard library (tkinter) for easy .exe compilation.
"""

import os
import sys
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
import math

# ═══════════════════════════════════════════════════════════════════════════════
# Design Tokens
# ═══════════════════════════════════════════════════════════════════════════════
class Theme:
    # Backgrounds
    BG_PRIMARY    = "#0f0f1a"
    BG_SECONDARY  = "#161625"
    BG_CARD       = "#1c1c30"
    BG_CARD_HOVER = "#222240"
    BG_INPUT      = "#12122a"
    BG_INPUT_FOCUS= "#1a1a3a"

    # Accent colors
    PURPLE        = "#7c5cfc"
    PURPLE_LIGHT  = "#9b82ff"
    PURPLE_DARK   = "#5a3fd4"
    CYAN          = "#00d4ff"
    CYAN_DARK     = "#00a8cc"
    GREEN         = "#00e89d"
    GREEN_DARK    = "#00c080"
    ORANGE        = "#ff8c42"
    ORANGE_DARK   = "#e07030"
    RED           = "#ff5c6c"
    RED_DARK      = "#cc4050"
    PINK          = "#ff6eb4"

    # Text
    TEXT          = "#e8e8f0"
    TEXT_DIM      = "#8888aa"
    TEXT_MUTED    = "#555577"

    # Border
    BORDER        = "#2a2a4a"
    BORDER_FOCUS  = "#7c5cfc"

    # Fonts
    FONT          = "Segoe UI"
    FONT_MONO     = "Consolas"


PROJECT_DIR = Path(__file__).parent.resolve()


# ═══════════════════════════════════════════════════════════════════════════════
# Custom Widgets
# ═══════════════════════════════════════════════════════════════════════════════

class RoundedButton(tk.Canvas):
    """A modern rounded button with hover animation."""

    def __init__(self, parent, text="Button", command=None,
                 bg_color=Theme.PURPLE, hover_color=Theme.PURPLE_LIGHT,
                 text_color="#ffffff", width=200, height=44, radius=22,
                 font_size=11, icon="", **kwargs):
        super().__init__(parent, width=width, height=height,
                         bg=self._get_parent_bg(parent),
                         highlightthickness=0, **kwargs)
        self.command = command
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.text_color = text_color
        self.w = width
        self.h = height
        self.r = radius
        self.display_text = f"{icon}  {text}" if icon else text
        self.font_size = font_size
        self._disabled = False
        self._hover = False

        self._draw(bg_color)
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<ButtonPress-1>", self._on_press)
        self.bind("<ButtonRelease-1>", self._on_release)

    def _get_parent_bg(self, parent):
        try:
            return parent.cget("bg")
        except Exception:
            return Theme.BG_CARD

    def _draw(self, color):
        self.delete("all")
        r, w, h = self.r, self.w, self.h
        # Shadow
        self._rounded_rect(2, 3, w - 1, h, r, "#080815")
        # Main body
        self._rounded_rect(0, 0, w - 2, h - 3, r, color)
        # Text
        self.create_text(w // 2, (h - 3) // 2, text=self.display_text,
                         fill=self.text_color if not self._disabled else Theme.TEXT_MUTED,
                         font=(Theme.FONT, self.font_size, "bold"))

    def _rounded_rect(self, x1, y1, x2, y2, r, color):
        self.create_arc(x1, y1, x1 + 2*r, y1 + 2*r, start=90, extent=90,
                        fill=color, outline=color)
        self.create_arc(x2 - 2*r, y1, x2, y1 + 2*r, start=0, extent=90,
                        fill=color, outline=color)
        self.create_arc(x1, y2 - 2*r, x1 + 2*r, y2, start=180, extent=90,
                        fill=color, outline=color)
        self.create_arc(x2 - 2*r, y2 - 2*r, x2, y2, start=270, extent=90,
                        fill=color, outline=color)
        self.create_rectangle(x1 + r, y1, x2 - r, y2, fill=color, outline=color)
        self.create_rectangle(x1, y1 + r, x1 + r, y2 - r, fill=color, outline=color)
        self.create_rectangle(x2 - r, y1 + r, x2, y2 - r, fill=color, outline=color)

    def _on_enter(self, e):
        if not self._disabled:
            self._hover = True
            self._draw(self.hover_color)
            self.config(cursor="hand2")

    def _on_leave(self, e):
        self._hover = False
        self._draw(self.bg_color)
        self.config(cursor="")

    def _on_press(self, e):
        if not self._disabled:
            self._draw(self.bg_color)

    def _on_release(self, e):
        if not self._disabled and self.command:
            self._draw(self.hover_color if self._hover else self.bg_color)
            self.command()

    def set_disabled(self, disabled):
        self._disabled = disabled
        self._draw(self.bg_color)

    def configure_text(self, text):
        self.display_text = text
        self._draw(self.hover_color if self._hover else self.bg_color)


class GlowLabel(tk.Canvas):
    """A label with a subtle glow effect."""

    def __init__(self, parent, text="", font_size=20, color=Theme.PURPLE_LIGHT,
                 glow_color=None, **kwargs):
        bg = kwargs.pop("bg", Theme.BG_PRIMARY)
        super().__init__(parent, bg=bg, highlightthickness=0, height=font_size + 20, **kwargs)
        self.bind("<Configure>", lambda e: self._draw(text, font_size, color, glow_color or color))

    def _draw(self, text, size, color, glow):
        self.delete("all")
        cx = 20
        cy = self.winfo_height() // 2
        # Glow layers
        for i, alpha in enumerate(["15", "20", "10"]):
            offset = (3 - i)
            self.create_text(cx, cy, text=text, fill=glow, anchor="w",
                             font=(Theme.FONT, size + offset, "bold"))
        self.create_text(cx, cy, text=text, fill=color, anchor="w",
                         font=(Theme.FONT, size, "bold"))


class StyledEntry(tk.Frame):
    """Entry with icon-like label and focus highlight."""

    def __init__(self, parent, placeholder="", label="", **kwargs):
        super().__init__(parent, bg=Theme.BG_CARD)
        if label:
            lbl = tk.Label(self, text=label, bg=Theme.BG_CARD, fg=Theme.TEXT_DIM,
                           font=(Theme.FONT, 9))
            lbl.pack(anchor="w", pady=(0, 3))

        frame = tk.Frame(self, bg=Theme.BORDER, padx=1, pady=1)
        frame.pack(fill="x")

        inner = tk.Frame(frame, bg=Theme.BG_INPUT)
        inner.pack(fill="x")

        self.entry = tk.Entry(inner, bg=Theme.BG_INPUT, fg=Theme.TEXT,
                              insertbackground=Theme.CYAN,
                              font=(Theme.FONT, 10), relief="flat", bd=8,
                              **kwargs)
        self.entry.pack(fill="x")

        # Focus effects
        self.entry.bind("<FocusIn>", lambda e: frame.configure(bg=Theme.BORDER_FOCUS))
        self.entry.bind("<FocusOut>", lambda e: frame.configure(bg=Theme.BORDER))

        if placeholder:
            self._add_placeholder(placeholder)

    def _add_placeholder(self, text):
        self.entry.insert(0, text)
        self.entry.configure(fg=Theme.TEXT_MUTED)

        def on_focus_in(e):
            if self.entry.get() == text:
                self.entry.delete(0, tk.END)
                self.entry.configure(fg=Theme.TEXT)

        def on_focus_out(e):
            if not self.entry.get():
                self.entry.insert(0, text)
                self.entry.configure(fg=Theme.TEXT_MUTED)

        self.entry.bind("<FocusIn>", on_focus_in, add="+")
        self.entry.bind("<FocusOut>", on_focus_out, add="+")

    def get(self):
        return self.entry.get()

    def set(self, val):
        self.entry.delete(0, tk.END)
        self.entry.insert(0, val)
        self.entry.configure(fg=Theme.TEXT)

    def clear(self):
        self.entry.delete(0, tk.END)


class StyledText(tk.Frame):
    """Multiline text with focus highlight."""

    def __init__(self, parent, height=4, label="", **kwargs):
        super().__init__(parent, bg=Theme.BG_CARD)
        if label:
            lbl = tk.Label(self, text=label, bg=Theme.BG_CARD, fg=Theme.TEXT_DIM,
                           font=(Theme.FONT, 9))
            lbl.pack(anchor="w", pady=(0, 3))

        frame = tk.Frame(self, bg=Theme.BORDER, padx=1, pady=1)
        frame.pack(fill="x")

        self.text = tk.Text(frame, bg=Theme.BG_INPUT, fg=Theme.TEXT,
                            insertbackground=Theme.CYAN,
                            font=(Theme.FONT, 10), relief="flat", bd=8,
                            height=height, wrap="word",
                            selectbackground=Theme.PURPLE_DARK,
                            **kwargs)
        self.text.pack(fill="x")

        self.text.bind("<FocusIn>", lambda e: frame.configure(bg=Theme.BORDER_FOCUS))
        self.text.bind("<FocusOut>", lambda e: frame.configure(bg=Theme.BORDER))

    def get(self):
        return self.text.get("1.0", "end").strip()

    def set(self, val):
        self.text.delete("1.0", "end")
        self.text.insert("1.0", val)


class StyledCombobox(tk.Frame):
    """Styled dropdown."""

    def __init__(self, parent, values=None, default=None, label="", width=None, **kwargs):
        super().__init__(parent, bg=Theme.BG_CARD)
        if label:
            lbl = tk.Label(self, text=label, bg=Theme.BG_CARD, fg=Theme.TEXT_DIM,
                           font=(Theme.FONT, 9))
            lbl.pack(anchor="w", pady=(0, 3))

        self.var = tk.StringVar(value=default or (values[0] if values else ""))
        opts = dict(textvariable=self.var, values=values or [], state="readonly",
                    font=(Theme.FONT, 10))
        if width:
            opts["width"] = width
        self.combo = ttk.Combobox(self, **opts)
        self.combo.pack(fill="x")

    def get(self):
        return self.var.get()

    def set(self, val):
        self.var.set(val)


class Card(tk.Frame):
    """A card container with rounded-look borders."""

    def __init__(self, parent, **kwargs):
        super().__init__(parent, bg=Theme.BG_CARD, padx=20, pady=15, **kwargs)
        # Subtle top-border line
        accent_line = tk.Frame(self, bg=Theme.PURPLE, height=2)
        accent_line.pack(fill="x", side="top", pady=(0, 10))


# ═══════════════════════════════════════════════════════════════════════════════
# Main Application
# ═══════════════════════════════════════════════════════════════════════════════

class OmniVoiceApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OmniVoice")
        self.root.geometry("880x780")
        self.root.minsize(800, 700)
        self.root.configure(bg=Theme.BG_PRIMARY)

        # Try to set DPI awareness
        try:
            from ctypes import windll
            windll.shcore.SetProcessDpiAwareness(1)
        except Exception:
            pass

        self._apply_ttk_style()
        self.demo_process = None
        self.current_tab = 0

        self._build_ui()
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _apply_ttk_style(self):
        style = ttk.Style(self.root)
        style.theme_use("clam")

        style.configure("TCombobox",
                        fieldbackground=Theme.BG_INPUT,
                        background=Theme.BG_CARD,
                        foreground=Theme.TEXT,
                        arrowcolor=Theme.TEXT_DIM,
                        selectbackground=Theme.PURPLE_DARK,
                        font=(Theme.FONT, 10))
        style.map("TCombobox",
                  fieldbackground=[("readonly", Theme.BG_INPUT)],
                  foreground=[("readonly", Theme.TEXT)],
                  selectbackground=[("readonly", Theme.PURPLE_DARK)])

        style.configure("TCheckbutton",
                        background=Theme.BG_CARD,
                        foreground=Theme.TEXT,
                        font=(Theme.FONT, 10))
        style.map("TCheckbutton",
                  background=[("active", Theme.BG_CARD)])

    # ─── Build UI ─────────────────────────────────────────────────────────

    def _build_ui(self):
        # Header
        self._build_header()

        # Tab bar
        self._build_tab_bar()

        # Content area (stacked frames)
        self.content_area = tk.Frame(self.root, bg=Theme.BG_PRIMARY)
        self.content_area.pack(fill="both", expand=True, padx=20, pady=(0, 0))

        self.tabs = {}
        self._build_demo_tab()
        self._build_clone_tab()
        self._build_design_tab()
        self._build_auto_tab()

        # Status bar
        self._build_status_bar()

        # Show first tab
        self._show_tab(0)

    def _build_header(self):
        header = tk.Frame(self.root, bg=Theme.BG_PRIMARY, pady=12)
        header.pack(fill="x", padx=25)

        # Title row
        title_row = tk.Frame(header, bg=Theme.BG_PRIMARY)
        title_row.pack(fill="x")

        tk.Label(title_row, text="🌍", font=(Theme.FONT, 24), bg=Theme.BG_PRIMARY,
                 fg=Theme.TEXT).pack(side="left")
        tk.Label(title_row, text=" OmniVoice", font=(Theme.FONT, 22, "bold"),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT).pack(side="left")

        # Version badge
        badge = tk.Label(title_row, text=" v0.1.4 ", font=(Theme.FONT, 8),
                         bg=Theme.PURPLE_DARK, fg="#ffffff", padx=6, pady=1)
        badge.pack(side="left", padx=(10, 0), pady=(6, 0))

        # Subtitle
        tk.Label(header, text="600+ 언어 지원  ·  제로샷 TTS  ·  음성 복제 & 디자인",
                 font=(Theme.FONT, 10), bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM
                 ).pack(anchor="w", padx=(4, 0), pady=(2, 0))

        # Separator
        sep = tk.Frame(self.root, bg=Theme.BORDER, height=1)
        sep.pack(fill="x", padx=20)

    def _build_tab_bar(self):
        bar = tk.Frame(self.root, bg=Theme.BG_SECONDARY, pady=4)
        bar.pack(fill="x", padx=20, pady=(0, 0))

        self.tab_buttons = []
        tabs = [
            ("🖥  웹 데모", Theme.GREEN),
            ("🎙  음성 복제", Theme.CYAN),
            ("🎨  음성 디자인", Theme.PURPLE_LIGHT),
            ("✨  자동 음성", Theme.ORANGE),
        ]

        for i, (text, color) in enumerate(tabs):
            btn = tk.Label(bar, text=f"  {text}  ", font=(Theme.FONT, 10, "bold"),
                           bg=Theme.BG_SECONDARY, fg=Theme.TEXT_MUTED,
                           padx=12, pady=8, cursor="hand2")
            btn.pack(side="left", padx=(0, 2))
            btn._tab_index = i
            btn._accent = color
            btn.bind("<Button-1>", lambda e, idx=i: self._show_tab(idx))
            btn.bind("<Enter>", lambda e, b=btn: self._tab_hover(b, True))
            btn.bind("<Leave>", lambda e, b=btn: self._tab_hover(b, False))
            self.tab_buttons.append(btn)

    def _tab_hover(self, btn, enter):
        if btn._tab_index != self.current_tab:
            btn.configure(fg=Theme.TEXT if enter else Theme.TEXT_MUTED,
                          bg=Theme.BG_CARD if enter else Theme.BG_SECONDARY)

    def _show_tab(self, index):
        self.current_tab = index
        for i, btn in enumerate(self.tab_buttons):
            if i == index:
                btn.configure(bg=Theme.BG_PRIMARY, fg=btn._accent)
            else:
                btn.configure(bg=Theme.BG_SECONDARY, fg=Theme.TEXT_MUTED)

        for name, frame in self.tabs.items():
            frame.pack_forget()

        tab_names = ["demo", "clone", "design", "auto"]
        self.tabs[tab_names[index]].pack(fill="both", expand=True)

    # ─── Tab: Web Demo ────────────────────────────────────────────────────

    def _build_demo_tab(self):
        frame = tk.Frame(self.content_area, bg=Theme.BG_PRIMARY)
        self.tabs["demo"] = frame

        # Center card
        center = tk.Frame(frame, bg=Theme.BG_PRIMARY)
        center.place(relx=0.5, rely=0.45, anchor="center")

        # Icon
        tk.Label(center, text="🚀", font=(Theme.FONT, 48), bg=Theme.BG_PRIMARY).pack()
        tk.Label(center, text="웹 데모 실행", font=(Theme.FONT, 18, "bold"),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT).pack(pady=(5, 3))
        tk.Label(center, text="브라우저에서 OmniVoice의 모든 기능을 체험해보세요",
                 font=(Theme.FONT, 10), bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM).pack(pady=(0, 20))

        # Port
        port_row = tk.Frame(center, bg=Theme.BG_PRIMARY)
        port_row.pack(pady=(0, 6))
        tk.Label(port_row, text="포트:", font=(Theme.FONT, 10),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM).pack(side="left", padx=(0, 8))
        self.demo_port_entry = tk.Entry(port_row, bg=Theme.BG_INPUT, fg=Theme.TEXT,
                                        insertbackground=Theme.CYAN, font=(Theme.FONT, 10),
                                        relief="flat", bd=6, width=8, justify="center")
        self.demo_port_entry.insert(0, "7860")
        self.demo_port_entry.pack(side="left")

        # Share checkbox
        self.demo_share = tk.BooleanVar(value=False)
        ttk.Checkbutton(center, text="외부 공유 링크 생성 (--share)",
                        variable=self.demo_share).pack(pady=(6, 18))

        # Buttons
        btn_row = tk.Frame(center, bg=Theme.BG_PRIMARY)
        btn_row.pack()

        self.demo_start_btn = RoundedButton(
            btn_row, text="데모 시작", icon="▶", command=self._start_demo,
            bg_color=Theme.GREEN_DARK, hover_color=Theme.GREEN,
            width=180, height=48, radius=24, font_size=12)
        self.demo_start_btn.pack(side="left", padx=(0, 12))

        self.demo_stop_btn = RoundedButton(
            btn_row, text="데모 중지", icon="■", command=self._stop_demo,
            bg_color="#44445a", hover_color=Theme.RED,
            width=180, height=48, radius=24, font_size=12)
        self.demo_stop_btn.pack(side="left")
        self.demo_stop_btn.set_disabled(True)

        # Status
        self.demo_status = tk.Label(center, text="", font=(Theme.FONT, 10),
                                    bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM)
        self.demo_status.pack(pady=(18, 0))

    # ─── Tab: Voice Clone ─────────────────────────────────────────────────

    def _build_clone_tab(self):
        frame = tk.Frame(self.content_area, bg=Theme.BG_PRIMARY)
        self.tabs["clone"] = frame

        # Scrollable
        canvas = tk.Canvas(frame, bg=Theme.BG_PRIMARY, highlightthickness=0)
        vscroll = tk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        inner = tk.Frame(canvas, bg=Theme.BG_PRIMARY)
        inner.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=inner, anchor="nw", tags="inner")
        canvas.configure(yscrollcommand=vscroll.set)
        canvas.bind("<Configure>", lambda e: canvas.itemconfig("inner", width=e.width))

        vscroll.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)
        canvas.bind_all("<MouseWheel>",
                        lambda e: canvas.yview_scroll(-1 * (e.delta // 120), "units"))

        # Header
        hdr = tk.Frame(inner, bg=Theme.BG_PRIMARY)
        hdr.pack(fill="x", pady=(10, 5))
        tk.Label(hdr, text="🎙", font=(Theme.FONT, 20), bg=Theme.BG_PRIMARY).pack(side="left")
        tk.Label(hdr, text="  음성 복제", font=(Theme.FONT, 16, "bold"),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT).pack(side="left")
        tk.Label(inner, text="레퍼런스 오디오의 목소리를 복제하여 원하는 텍스트를 말하게 합니다 (3~10초 오디오 권장)",
                 font=(Theme.FONT, 9), bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM).pack(anchor="w", padx=4)

        # Card
        card = tk.Frame(inner, bg=Theme.BG_CARD, padx=20, pady=16)
        card.pack(fill="x", pady=(10, 0))
        # accent bar
        tk.Frame(card, bg=Theme.CYAN, height=3).pack(fill="x", pady=(0, 12))

        # Text
        self.clone_text = StyledText(card, height=3, label="📝  읽을 텍스트")
        self.clone_text.pack(fill="x", pady=(0, 8))

        # Ref audio
        ref_row = tk.Frame(card, bg=Theme.BG_CARD)
        ref_row.pack(fill="x", pady=(0, 8))
        self.clone_ref = StyledEntry(ref_row, label="🎵  레퍼런스 오디오 파일")
        self.clone_ref.pack(side="left", fill="x", expand=True, padx=(0, 8))
        browse_btn = RoundedButton(ref_row, text="찾기", width=80, height=34, radius=17,
                                   font_size=9, bg_color=Theme.PURPLE_DARK,
                                   hover_color=Theme.PURPLE,
                                   command=lambda: self._browse_audio(self.clone_ref))
        browse_btn.pack(side="right", pady=(18, 0))

        # Ref text
        self.clone_ref_text = StyledEntry(card, label="💬  레퍼런스 텍스트 (비우면 자동 인식)")
        self.clone_ref_text.pack(fill="x", pady=(0, 8))

        # Language
        self.clone_lang = StyledCombobox(card, label="🌐  언어",
                                         values=["자동 감지", "Korean", "English", "Japanese",
                                                  "Chinese", "Spanish", "French", "German"],
                                         default="자동 감지")
        self.clone_lang.pack(fill="x", pady=(0, 8))

        # Settings row
        settings_frame = tk.Frame(card, bg=Theme.BG_CARD)
        settings_frame.pack(fill="x", pady=(4, 8))
        tk.Label(settings_frame, text="⚙  생성 옵션", font=(Theme.FONT, 9),
                 bg=Theme.BG_CARD, fg=Theme.TEXT_DIM).pack(anchor="w", pady=(0, 5))

        opts = tk.Frame(settings_frame, bg=Theme.BG_CARD)
        opts.pack(fill="x")

        self.clone_speed = self._make_mini_input(opts, "속도", "1.0")
        self.clone_steps = self._make_mini_input(opts, "스텝", "32")
        self.clone_guidance = self._make_mini_input(opts, "가이던스", "2.0")

        # Output
        out_row = tk.Frame(card, bg=Theme.BG_CARD)
        out_row.pack(fill="x", pady=(0, 8))
        self.clone_output = StyledEntry(out_row, label="💾  출력 파일")
        self.clone_output.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.clone_output.set(str(PROJECT_DIR / "output_clone.wav"))
        save_btn = RoundedButton(out_row, text="찾기", width=80, height=34, radius=17,
                                 font_size=9, bg_color=Theme.PURPLE_DARK,
                                 hover_color=Theme.PURPLE,
                                 command=lambda: self._save_wav(self.clone_output))
        save_btn.pack(side="right", pady=(18, 0))

        # Generate
        self.clone_gen_btn = RoundedButton(
            inner, text="음성 생성", icon="🔊",
            bg_color=Theme.CYAN_DARK, hover_color=Theme.CYAN,
            width=240, height=50, radius=25, font_size=13,
            command=self._run_clone)
        self.clone_gen_btn.pack(pady=18)

    # ─── Tab: Voice Design ────────────────────────────────────────────────

    def _build_design_tab(self):
        frame = tk.Frame(self.content_area, bg=Theme.BG_PRIMARY)
        self.tabs["design"] = frame

        canvas = tk.Canvas(frame, bg=Theme.BG_PRIMARY, highlightthickness=0)
        vscroll = tk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        inner = tk.Frame(canvas, bg=Theme.BG_PRIMARY)
        inner.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=inner, anchor="nw", tags="inner")
        canvas.configure(yscrollcommand=vscroll.set)
        canvas.bind("<Configure>", lambda e: canvas.itemconfig("inner", width=e.width))

        vscroll.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        # Header
        hdr = tk.Frame(inner, bg=Theme.BG_PRIMARY)
        hdr.pack(fill="x", pady=(10, 5))
        tk.Label(hdr, text="🎨", font=(Theme.FONT, 20), bg=Theme.BG_PRIMARY).pack(side="left")
        tk.Label(hdr, text="  음성 디자인", font=(Theme.FONT, 16, "bold"),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT).pack(side="left")
        tk.Label(inner, text="원하는 목소리 특성을 조합하여 새로운 음성을 생성합니다 · 레퍼런스 오디오 불필요",
                 font=(Theme.FONT, 9), bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM).pack(anchor="w", padx=4)

        card = tk.Frame(inner, bg=Theme.BG_CARD, padx=20, pady=16)
        card.pack(fill="x", pady=(10, 0))
        tk.Frame(card, bg=Theme.PURPLE, height=3).pack(fill="x", pady=(0, 12))

        # Text
        self.design_text = StyledText(card, height=3, label="📝  읽을 텍스트")
        self.design_text.pack(fill="x", pady=(0, 10))

        # Voice attributes section
        attr_label = tk.Frame(card, bg=Theme.BG_CARD)
        attr_label.pack(fill="x", pady=(0, 6))
        tk.Label(attr_label, text="🎛  목소리 특성", font=(Theme.FONT, 10, "bold"),
                 bg=Theme.BG_CARD, fg=Theme.PURPLE_LIGHT).pack(side="left")

        # Row 1: gender + age
        r1 = tk.Frame(card, bg=Theme.BG_CARD)
        r1.pack(fill="x", pady=(0, 6))
        self.design_gender = StyledCombobox(r1, label="성별",
                                            values=["선택 안함", "male", "female"],
                                            default="선택 안함", width=14)
        self.design_gender.pack(side="left", padx=(0, 12))
        self.design_age = StyledCombobox(r1, label="연령",
                                         values=["선택 안함", "child", "teenager",
                                                  "young adult", "middle-aged", "elderly"],
                                         default="선택 안함", width=14)
        self.design_age.pack(side="left", padx=(0, 12))
        self.design_pitch = StyledCombobox(r1, label="피치",
                                           values=["선택 안함", "very low pitch", "low pitch",
                                                    "moderate pitch", "high pitch", "very high pitch"],
                                           default="선택 안함", width=14)
        self.design_pitch.pack(side="left")

        # Row 2: style + accent
        r2 = tk.Frame(card, bg=Theme.BG_CARD)
        r2.pack(fill="x", pady=(0, 8))
        self.design_style = StyledCombobox(r2, label="스타일",
                                           values=["선택 안함", "whisper"],
                                           default="선택 안함", width=14)
        self.design_style.pack(side="left", padx=(0, 12))
        self.design_accent = StyledCombobox(r2, label="억양 / 방언",
                                            values=["선택 안함",
                                                     "American accent", "British accent",
                                                     "Australian accent", "Korean accent",
                                                     "Chinese accent", "Japanese accent",
                                                     "Indian accent", "Russian accent"],
                                            default="선택 안함", width=20)
        self.design_accent.pack(side="left")

        # Direct instruct input
        sep = tk.Frame(card, bg=Theme.BORDER, height=1)
        sep.pack(fill="x", pady=(6, 8))
        self.design_raw = StyledEntry(card, label="✏️  또는 직접 입력 (예: female, low pitch, british accent)")
        self.design_raw.pack(fill="x", pady=(0, 4))
        tk.Label(card, text="↑ 직접 입력 시 위 드롭다운 설정이 무시됩니다",
                 font=(Theme.FONT, 8), bg=Theme.BG_CARD, fg=Theme.TEXT_MUTED).pack(anchor="w")

        # Language
        self.design_lang = StyledCombobox(card, label="🌐  언어",
                                          values=["자동 감지", "Korean", "English", "Japanese",
                                                   "Chinese", "Spanish", "French", "German"],
                                          default="자동 감지")
        self.design_lang.pack(fill="x", pady=(8, 8))

        # Settings
        settings_frame = tk.Frame(card, bg=Theme.BG_CARD)
        settings_frame.pack(fill="x", pady=(0, 8))
        tk.Label(settings_frame, text="⚙  생성 옵션", font=(Theme.FONT, 9),
                 bg=Theme.BG_CARD, fg=Theme.TEXT_DIM).pack(anchor="w", pady=(0, 5))
        opts = tk.Frame(settings_frame, bg=Theme.BG_CARD)
        opts.pack(fill="x")
        self.design_speed = self._make_mini_input(opts, "속도", "1.0")
        self.design_steps = self._make_mini_input(opts, "스텝", "32")
        self.design_guidance = self._make_mini_input(opts, "가이던스", "2.0")

        # Output
        out_row = tk.Frame(card, bg=Theme.BG_CARD)
        out_row.pack(fill="x", pady=(0, 8))
        self.design_output = StyledEntry(out_row, label="💾  출력 파일")
        self.design_output.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.design_output.set(str(PROJECT_DIR / "output_design.wav"))
        RoundedButton(out_row, text="찾기", width=80, height=34, radius=17,
                      font_size=9, bg_color=Theme.PURPLE_DARK, hover_color=Theme.PURPLE,
                      command=lambda: self._save_wav(self.design_output)
                      ).pack(side="right", pady=(18, 0))

        # Generate
        self.design_gen_btn = RoundedButton(
            inner, text="음성 생성", icon="🔊",
            bg_color=Theme.PURPLE_DARK, hover_color=Theme.PURPLE_LIGHT,
            width=240, height=50, radius=25, font_size=13,
            command=self._run_design)
        self.design_gen_btn.pack(pady=18)

    # ─── Tab: Auto Voice ──────────────────────────────────────────────────

    def _build_auto_tab(self):
        frame = tk.Frame(self.content_area, bg=Theme.BG_PRIMARY)
        self.tabs["auto"] = frame

        center = tk.Frame(frame, bg=Theme.BG_PRIMARY)
        center.pack(fill="both", expand=True, padx=10, pady=10)

        hdr = tk.Frame(center, bg=Theme.BG_PRIMARY)
        hdr.pack(fill="x", pady=(10, 5))
        tk.Label(hdr, text="✨", font=(Theme.FONT, 20), bg=Theme.BG_PRIMARY).pack(side="left")
        tk.Label(hdr, text="  자동 음성 생성", font=(Theme.FONT, 16, "bold"),
                 bg=Theme.BG_PRIMARY, fg=Theme.TEXT).pack(side="left")
        tk.Label(center, text="텍스트만 입력하면 모델이 자동으로 적합한 목소리를 선택합니다",
                 font=(Theme.FONT, 9), bg=Theme.BG_PRIMARY, fg=Theme.TEXT_DIM).pack(anchor="w", padx=4)

        card = tk.Frame(center, bg=Theme.BG_CARD, padx=20, pady=16)
        card.pack(fill="x", pady=(10, 0))
        tk.Frame(card, bg=Theme.ORANGE, height=3).pack(fill="x", pady=(0, 12))

        # Text
        self.auto_text = StyledText(card, height=4, label="📝  읽을 텍스트")
        self.auto_text.pack(fill="x", pady=(0, 8))

        # Language
        self.auto_lang = StyledCombobox(card, label="🌐  언어",
                                        values=["자동 감지", "Korean", "English", "Japanese",
                                                 "Chinese", "Spanish", "French", "German"],
                                        default="자동 감지")
        self.auto_lang.pack(fill="x", pady=(0, 8))

        # Settings
        settings_frame = tk.Frame(card, bg=Theme.BG_CARD)
        settings_frame.pack(fill="x", pady=(0, 8))
        tk.Label(settings_frame, text="⚙  생성 옵션", font=(Theme.FONT, 9),
                 bg=Theme.BG_CARD, fg=Theme.TEXT_DIM).pack(anchor="w", pady=(0, 5))
        opts = tk.Frame(settings_frame, bg=Theme.BG_CARD)
        opts.pack(fill="x")
        self.auto_speed = self._make_mini_input(opts, "속도", "1.0")
        self.auto_steps = self._make_mini_input(opts, "스텝", "32")
        self.auto_guidance = self._make_mini_input(opts, "가이던스", "2.0")

        # Output
        out_row = tk.Frame(card, bg=Theme.BG_CARD)
        out_row.pack(fill="x", pady=(0, 8))
        self.auto_output = StyledEntry(out_row, label="💾  출력 파일")
        self.auto_output.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.auto_output.set(str(PROJECT_DIR / "output_auto.wav"))
        RoundedButton(out_row, text="찾기", width=80, height=34, radius=17,
                      font_size=9, bg_color=Theme.PURPLE_DARK, hover_color=Theme.PURPLE,
                      command=lambda: self._save_wav(self.auto_output)
                      ).pack(side="right", pady=(18, 0))

        # Generate
        self.auto_gen_btn = RoundedButton(
            center, text="음성 생성", icon="🔊",
            bg_color=Theme.ORANGE_DARK, hover_color=Theme.ORANGE,
            width=240, height=50, radius=25, font_size=13,
            command=self._run_auto)
        self.auto_gen_btn.pack(pady=18)

    # ─── Status Bar ───────────────────────────────────────────────────────

    def _build_status_bar(self):
        bar = tk.Frame(self.root, bg=Theme.BG_SECONDARY, padx=20, pady=6)
        bar.pack(fill="x", side="bottom")

        self.status_dot = tk.Label(bar, text="●", font=(Theme.FONT, 8),
                                   bg=Theme.BG_SECONDARY, fg=Theme.GREEN)
        self.status_dot.pack(side="left")
        self.status_text = tk.Label(bar, text=" 대기 중", font=(Theme.FONT, 9),
                                    bg=Theme.BG_SECONDARY, fg=Theme.TEXT_DIM)
        self.status_text.pack(side="left")

        tk.Label(bar, text="OmniVoice v0.1.4  |  k2-fsa", font=(Theme.FONT, 8),
                 bg=Theme.BG_SECONDARY, fg=Theme.TEXT_MUTED).pack(side="right")

    def _set_status(self, msg, color=Theme.GREEN):
        self.status_dot.configure(fg=color)
        self.status_text.configure(text=f" {msg}")

    # ─── Helpers ──────────────────────────────────────────────────────────

    def _make_mini_input(self, parent, label, default):
        f = tk.Frame(parent, bg=Theme.BG_CARD)
        f.pack(side="left", padx=(0, 16))
        tk.Label(f, text=label, font=(Theme.FONT, 9), bg=Theme.BG_CARD,
                 fg=Theme.TEXT_DIM).pack(side="left", padx=(0, 4))
        e = tk.Entry(f, bg=Theme.BG_INPUT, fg=Theme.TEXT, insertbackground=Theme.CYAN,
                     font=(Theme.FONT, 10), relief="flat", bd=4, width=6, justify="center")
        e.insert(0, default)
        e.pack(side="left")
        return e

    def _browse_audio(self, entry_widget):
        path = filedialog.askopenfilename(
            title="오디오 파일 선택",
            filetypes=[("Audio", "*.wav *.mp3 *.flac *.ogg *.m4a"), ("All", "*.*")])
        if path:
            entry_widget.set(path)

    def _save_wav(self, entry_widget):
        path = filedialog.asksaveasfilename(
            title="출력 파일 저장",
            defaultextension=".wav",
            filetypes=[("WAV", "*.wav"), ("All", "*.*")])
        if path:
            entry_widget.set(path)

    def _get_lang(self, combo):
        v = combo.get()
        return None if v == "자동 감지" else v

    # ─── Demo control ────────────────────────────────────────────────────

    def _start_demo(self):
        port = self.demo_port_entry.get().strip() or "7860"
        cmd = ["uv", "run", "omnivoice-demo", "--ip", "0.0.0.0", "--port", port]
        if self.demo_share.get():
            cmd.append("--share")
        try:
            cflags = 0
            if sys.platform == "win32":
                cflags = subprocess.CREATE_NO_WINDOW
            self.demo_process = subprocess.Popen(
                cmd, cwd=str(PROJECT_DIR),
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                creationflags=cflags, text=True)
            self.demo_start_btn.set_disabled(True)
            self.demo_stop_btn.set_disabled(False)
            self.demo_status.configure(
                text=f"✅  http://localhost:{port} 에서 데모가 실행 중입니다",
                fg=Theme.GREEN)
            self._set_status(f"웹 데모 실행 중 (:{port})", Theme.GREEN)
            threading.Thread(target=self._watch_demo, daemon=True).start()
        except Exception as e:
            messagebox.showerror("오류", f"데모 시작 실패:\n{e}")

    def _watch_demo(self):
        if self.demo_process:
            self.demo_process.wait()
            self.root.after(0, self._demo_ended)

    def _demo_ended(self):
        self.demo_start_btn.set_disabled(False)
        self.demo_stop_btn.set_disabled(True)
        self.demo_status.configure(text="데모가 종료되었습니다", fg=Theme.TEXT_DIM)
        self._set_status("대기 중", Theme.GREEN)
        self.demo_process = None

    def _stop_demo(self):
        if self.demo_process:
            self.demo_process.terminate()
            self.demo_process = None
        self.demo_start_btn.set_disabled(False)
        self.demo_stop_btn.set_disabled(True)
        self.demo_status.configure(text="데모가 중지되었습니다", fg=Theme.ORANGE)
        self._set_status("대기 중", Theme.GREEN)

    # ─── Inference runner ─────────────────────────────────────────────────

    def _run_inference(self, args, button, label):
        button.set_disabled(True)
        self._set_status(f"{label} 생성 중... (모델 로딩 시 시간 소요)", Theme.ORANGE)

        cmd = ["uv", "run", "omnivoice-infer"] + args

        def work():
            try:
                cflags = subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
                r = subprocess.run(cmd, cwd=str(PROJECT_DIR),
                                   capture_output=True, text=True, timeout=600,
                                   creationflags=cflags)
                if r.returncode == 0:
                    self.root.after(0, lambda: self._set_status(f"✅ {label} 완료!", Theme.GREEN))
                    self.root.after(0, lambda: messagebox.showinfo("완료",
                                                                    "음성이 성공적으로 생성되었습니다! 🎉"))
                else:
                    err = (r.stderr or r.stdout or "알 수 없는 오류")[:500]
                    self.root.after(0, lambda: self._set_status("❌ 오류 발생", Theme.RED))
                    self.root.after(0, lambda: messagebox.showerror("오류", f"생성 실패:\n{err}"))
            except subprocess.TimeoutExpired:
                self.root.after(0, lambda: self._set_status("⏰ 시간 초과", Theme.RED))
                self.root.after(0, lambda: messagebox.showerror("오류", "시간 초과 (10분)"))
            except Exception as e:
                self.root.after(0, lambda: self._set_status("❌ 오류", Theme.RED))
                self.root.after(0, lambda: messagebox.showerror("오류", str(e)))
            finally:
                self.root.after(0, lambda: button.set_disabled(False))

        threading.Thread(target=work, daemon=True).start()

    def _run_clone(self):
        text = self.clone_text.get()
        ref = self.clone_ref.get().strip()
        out = self.clone_output.get().strip()
        if not text:
            return messagebox.showwarning("입력 필요", "텍스트를 입력해주세요.")
        if not ref:
            return messagebox.showwarning("입력 필요", "레퍼런스 오디오를 선택해주세요.")
        if not out:
            return messagebox.showwarning("입력 필요", "출력 경로를 지정해주세요.")

        args = ["--model", "k2-fsa/OmniVoice", "--text", text, "--ref_audio", ref,
                "--output", out, "--speed", self.clone_speed.get() or "1.0",
                "--num_step", self.clone_steps.get() or "32",
                "--guidance_scale", self.clone_guidance.get() or "2.0"]
        rt = self.clone_ref_text.get().strip()
        if rt:
            args += ["--ref_text", rt]
        lang = self._get_lang(self.clone_lang)
        if lang:
            args += ["--language", lang]
        self._run_inference(args, self.clone_gen_btn, "음성 복제")

    def _run_design(self):
        text = self.design_text.get()
        out = self.design_output.get().strip()
        if not text:
            return messagebox.showwarning("입력 필요", "텍스트를 입력해주세요.")
        if not out:
            return messagebox.showwarning("입력 필요", "출력 경로를 지정해주세요.")

        raw = self.design_raw.get().strip()
        if raw:
            instruct = raw
        else:
            parts = [v for v in [self.design_gender.get(), self.design_age.get(),
                                  self.design_pitch.get(), self.design_style.get(),
                                  self.design_accent.get()] if v and v != "선택 안함"]
            instruct = ", ".join(parts) if parts else None

        if not instruct:
            return messagebox.showwarning("입력 필요", "목소리 특성을 선택하거나 직접 입력해주세요.")

        args = ["--model", "k2-fsa/OmniVoice", "--text", text, "--instruct", instruct,
                "--output", out, "--speed", self.design_speed.get() or "1.0",
                "--num_step", self.design_steps.get() or "32",
                "--guidance_scale", self.design_guidance.get() or "2.0"]
        lang = self._get_lang(self.design_lang)
        if lang:
            args += ["--language", lang]
        self._run_inference(args, self.design_gen_btn, "음성 디자인")

    def _run_auto(self):
        text = self.auto_text.get()
        out = self.auto_output.get().strip()
        if not text:
            return messagebox.showwarning("입력 필요", "텍스트를 입력해주세요.")
        if not out:
            return messagebox.showwarning("입력 필요", "출력 경로를 지정해주세요.")

        args = ["--model", "k2-fsa/OmniVoice", "--text", text, "--output", out,
                "--speed", self.auto_speed.get() or "1.0",
                "--num_step", self.auto_steps.get() or "32",
                "--guidance_scale", self.auto_guidance.get() or "2.0"]
        lang = self._get_lang(self.auto_lang)
        if lang:
            args += ["--language", lang]
        self._run_inference(args, self.auto_gen_btn, "자동 음성")

    # ─── Cleanup ──────────────────────────────────────────────────────────

    def _on_close(self):
        if self.demo_process:
            self.demo_process.terminate()
        self.root.destroy()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = OmniVoiceApp()
    app.run()
