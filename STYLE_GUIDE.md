# Frontend style guide

`src/app.css` defines the shared typography, theme colors, and component classes. Use those classes and the shared Svelte components for new screens, including admin pages. When a style changes, update its shared definition, review all uses across public pages, admin pages, and dialogs, and update this guide in the same change.

## Typography

Use JetBrains Mono throughout. Keep interface labels in the site's lowercase style and preserve the capitalization of names and titles supplied by users or APIs.

| Role | Class or element | Size |
| --- | --- | --- |
| Home display title | `h1.text-display` | 36 px, 48 px from `lg` |
| Page title | `h1` or `text-page-title` | 30 px, 36 px from `sm` |
| Section title | `h2` or `text-section-title` | 20 px, 24 px from `sm` |
| Subsection and card title | `h3`–`h6` or `text-card-title` | 16 px, 18 px from `sm` |
| Normal text and field values | Body default or `text-body` | 14 px, 16 px from `sm` |
| Subtitle and secondary text | `subtitle` or `text-secondary` | 14 px |
| Compact media title | `compact-media-title` | 14 px |
| Compact media subtitle | `compact-media-subtitle` | 12 px |
| Compact metadata, dates, and tags | `text-meta` | 12 px |

Keep featured media cards at the standard card-title and subtitle sizes. Use the compact media styles for smaller cover cards. Compact titles stay on one line with an ellipsis when they run out of space. Keep the complete title in the markup and in a title tooltip.

Use `CustomH1` or `H1WithBreadCrumb` for page titles and `CustomH2` for green section headings with optional subtitles. Media group labels use `MediaColoredTitle` with yellow for in-progress groups and green for completed groups. Use `SectionSeparator` for a full-width, 2 px `bg2` rule between major sections. Pass grid span and margin classes from the parent layout. Use `CustomH3` for actual subsections. Use `fieldset` and `legend.section-label.field-group-label` for Motorsport pick groups. They use the 14 px media-strip treatment, with purple for qualifying and green for races. Use `text-section-title` for Motorsport page headings and `text-card-title` for its section headings. Carousel meeting names and status tags use 14 px text.

## Color

- Use the active theme's tokens. `bg-bg0` is the page background, `bg-bg1` is a surface, `bg-bg2` is a hover state, and `bg-bg3` is a border, divider, or neutral tag background. Use `text-fg0` for content and `text-gray` for supporting copy. Apply `text-fg0` directly to each theme preview item so its label and icons use the palette shown by that item.
- Blue marks page titles and accent actions. Green marks section titles, primary saves, and success. Red marks errors and destructive actions. Yellow marks warnings and in-progress media. Purple marks keyboard focus, external links, and editing highlights.
- Preserve meaningful accents on navigation cards and domain data, including team colors, game tiles, and scoring. Use accompanying text, labels, or tooltips wherever color encodes meaning. Use `text-bg0` on solid theme-colored backgrounds.
- Use the named palette in `src/lib/utils/profile-colors.ts` for user colors. Render a validated saved color through its theme variable, such as `var(--blue)`, so the same preference adapts to every theme.
- Wrap ordinary internal navigation labels in square brackets. Use `internal-link` for muted utility navigation, with the active header or home link in `fg0`. In the hamburger menu, links use `text-gray` by default and use `fg0` on their page or its subpages. Use `external-link` for all outbound links, which stay purple and underlined. Prefer semantic tokens to raw hex values in components.

## Components

| Pattern | Shared styles |
| --- | --- |
| Cards | `surface-card` for content, `surface-card-hover` for clickable surfaces, `card-link` for navigation cards with matching left accent borders and title colors |
| Lists | `surface-list` and `list-row` for management rows, `card-list` for spaced lists of cards. Separate rows with an 8 px gap. Use `UserAvatar` for user rows and group related actions. Calendar access lists use green borders for members and red borders for nonmembers. Admin user rows use blue borders to match the blue role button. |
| Tables | `data-table` for header and row styles, with `matrix-table` for dense standings. Put wide data tables in a horizontally scrollable wrapper. In a standings comparison, highlight only counted shared-round cells with `bg-bg1 text-fg0 font-semibold`. Rank, username, and total use the same row colors, with red for first place and blue for other selected players. |
| Labeled buttons | `button` plus `button-primary`, `button-secondary`, `button-quiet`, `button-accent`, `button-warning`, or `button-danger`. Use filled treatments for actions, with green for saves and red for cancel and delete. Secondary buttons use `bg3` and lighten to `bg4` on hover. Reserve `button-quiet` for low-emphasis controls such as header utilities. Use `DefaultButton` where its status API fits. |
| Icon actions | Filled `action-icon` with `action-icon-danger` for a red destructive action. Supply an accessible label. |
| Forms | `form-label` and `form-field` on labeled inputs, selects, and textareas. Use `form-feedback` with the appropriate status color and accessible status or alert role. |
| Tags | `tag` for short statuses or metadata, with a theme color when it communicates a state. Use `tag-series` for the gray fill and `bg0` text of book series tags. |
| Menus and dialogs | Keep the existing interaction primitive and use `menu-panel` and `menu-item`, or `dialog-backdrop` and `dialog-panel`. Keep the visible `bg3` border on popup surfaces. Motorsport driver dropdowns use a 4 px team-color accent on the trigger and options. The qualifying time input uses the same 4 px width in purple. Use a blue dialog title, smaller green subsection headings, and a red `action-icon-danger` for the close button. |

Keep corners square. Use a 16 px default card inset and a 16 px gap between panels. Use 8 px gaps between closely related controls or cards in a list. Standard buttons and icon actions have a 40 px minimum target. Keep visible keyboard focus and disabled states. Dense calendars, score matrices, and game boards use their own layout and sizing while sharing the typography, palette, and focus treatment. Verify changes at narrow and wide widths and in both themes offered by the header.
