<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Keep homepage content and interactions in focused site components; the index route only composes the page and owns its metadata. This keeps the route readable as later phases replace placeholders with managed data.
- Mount cross-site registration once in the root layout and open it through shared register triggers. This keeps one accessible form and one submission flow across every page.
