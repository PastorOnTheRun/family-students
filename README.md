# Family Students

Public page for students and parents. Where to be this Wednesday, what’s next, and how to find the campus.

Live site: https://pastorontherun.github.io/family-students/

## Update a Wednesday

Edit `content.json` on GitHub and commit. The layout does not change. GitHub Actions publishes the site.

- Dates look like `Wednesday, October 7 · 6:30 PM` (Eastern).
- Leave a field as `""` to hide it.
- Only paste a maps or signup link if it is a real `https://` URL.
- Chapel is high school. Annex is junior high.
- Do not call Oakland home.
- Do not add student names, contacts, or prayer requests.
- Set `"sample": false` when the week is real.

Leaders stay on [Stage Ready](https://pastorontherun.github.io/stage-ready/).

## Be Class

Student and parent page, separate from this Wednesday guide and from Stage Ready.

Live page: https://pastorontherun.github.io/family-students/be-class/

Edit `be-class/content.json`. The field list is `be-class/CONTENT.md`. Leave unknown time, room, and form URL empty. Do not add student names.

## Pages

One time: **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)`**. The Actions workflow cannot publish until that is on. After that, every commit to `main` publishes the site.
