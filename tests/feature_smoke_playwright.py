"""Playwright smoke tests covering core UX expectations.

These tests exercise the hero cover, stage header, hint control,
arrow-key navigation, manual validation flow, and player-entry styling.

Usage:
    python tests/feature_smoke_playwright.py --base-url http://127.0.0.1:8000/

A running dev server (e.g. `python -m http.server 8000`) is required.
"""

import argparse
import asyncio
from playwright.async_api import async_playwright


async def run_checks(base_url: str) -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto(base_url, wait_until="load")
            await page.wait_for_function(
                "document.querySelectorAll('.cell').length === 81",
                timeout=10_000,
            )

            failures: list[str] = []

            if not await page.is_visible("header.app-hero"):
                failures.append("Hero cover not visible")

            stage_title = await page.text_content("#boardStageTitle")
            if not stage_title or "ステージ" not in stage_title:
                failures.append("Stage header did not report the current stage")

            if not await page.is_visible("#hintButton"):
                failures.append("Hint button missing from sidebar")

            first_unlocked = await page.evaluate(
                "document.querySelector('.cell:not(.locked)')?.dataset.index || null"
            )
            if first_unlocked is None:
                failures.append("No editable cell found on initial board")
            else:
                await page.click(f".cell[data-index='{first_unlocked}']")
                await page.wait_for_timeout(120)
                await page.keyboard.press("ArrowRight")
                await page.wait_for_timeout(120)
                new_index = await page.evaluate(
                    "document.querySelector('.cell.selected')?.dataset.index || null"
                )
                if new_index == first_unlocked:
                    failures.append("Arrow key navigation did not change selection")

                await page.keyboard.press("1")
                await page.wait_for_timeout(120)
                classes = await page.evaluate(
                    "document.querySelector('.cell.selected')?.className || ''"
                )
                if "user-entry" not in classes.split():
                    failures.append("Player input did not receive user-entry class")

                has_error = await page.evaluate(
                    "document.querySelector('.cell.selected')?.classList.contains('error') || false"
                )
                if has_error:
                    failures.append("Immediate error highlighting still occurs on entry")

                user_color = await page.evaluate(
                    "(() => { const el = document.querySelector('.cell.selected .value');"
                    " return el ? getComputedStyle(el).color : null; })()"
                )
                locked_color = await page.evaluate(
                    "(() => { const el = document.querySelector('.cell.locked .value');"
                    " return el ? getComputedStyle(el).color : null; })()"
                )
                if not user_color or not locked_color or user_color == locked_color:
                    failures.append("Player digits are not visually distinct from givens")

            if failures:
                for failure in failures:
                    print(f"[FAIL] {failure}")
                raise SystemExit(1)

            print("All feature checks passed.")
        finally:
            await browser.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8000/",
        help="URL of the running development server",
    )
    args = parser.parse_args()
    asyncio.run(run_checks(args.base_url))


if __name__ == "__main__":
    main()
