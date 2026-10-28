# Collective website refresh

## Direction
Buildly is the collective; CollabHub is the main participation destination. ProductLabs is the new name for Labs, with the business-friendly open source release described as a transition. First City Foundry connects the collective to local founder support and community.

## Design reference
The palette and typography follow `~/Projects/buildly/collabhub/mysite/templates/base.html`: Forge Navy #0F1B2A, Steel Slate #2B3643, Teal #16C4B5, Aqua Mist #B9F1EA, Warm Ember #F5A623, Forged Light #F6F7F9; Sora headings, Inter body, 8px corners. Illustrations in `docs/media/community/` are copied from that checkout's `mysite/static/img/design-system/` assets. They are illustrations, not member or activity evidence.

## Research
Data, source links, sample sizes, calculation methods, and caveats are in `docs/data/community-research.json`. The homepage charts use the 2025 Open Source ROI Survey (tables A16/A18/A19) and the 2024 Open Source Software Funding Report. The research page compares organizational roles, not performance, and distinguishes our interpretation from survey results. Findings are not claims about Buildly members. Reviewed October 28, 2026.

## Preserved content
The article directory and RSS feed are unchanged. Article listings, video content, biographies, and the original Our Story copy are retained. Historical references to Labs remain in published articles. Legal copy remains unchanged. Existing URLs continue to resolve, including labs.html and platform/index.html; the Labs application URL is retained.

## Implementation
Static HTML served from docs/, with shared presentation in css/collective.css and menu/theme/referral behavior in js/collective.js. Navigation and footer markup are static so the current pages work without a navigation fetch. The legacy nav loader replaces, rather than duplicates, existing article navigation. It skips pages with data-no-nav-loader.

The existing analytics configuration receives community_referral events with destination, path, and placement for CollabHub and First City Foundry links. No additional analytics service is introduced.

## Validation
Checked local links, fragments, single page headings and navigation, archive preservation, JavaScript syntax, mobile overflow, keyboard menu dismissal, theme switching, archive filtering, and source data calculations. Reviewed desktop and mobile screenshots in both themes. Changes are local; no deployment or commit was performed.

## Transition details
Publish ProductLabs repository, license, and release links when those are settled. Current pricing is linked to the relevant application or engagement discussion instead of inventing new rates. Coordinate the ProductLabs rename in the CollabHub app and the Buildly description on First City Foundry separately.
