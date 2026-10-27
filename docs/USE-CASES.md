# Finding the three use cases

The use cases are the video. If you get them wrong, no amount of motion design will save it. Do this before the mood board. It works the same way for web, mobile and desktop apps.

## 1. Gather

Look in this order and write down every job the feature does:

1. **The feature itself.** Use it in the real app with demo data. Every button, suggestion chip, empty-state example, onboarding tip and menu item is a hint.
   - In the example (an ads tool), the AI panel's chips ("Show only these", "Compare performance", "Create comparison report") pointed straight at the use cases.
   - In a project tool, the empty state of a new "Plan my week" feature might suggest "Sort by due date", "Find blocked tasks" and "Share a weekly summary".
2. **Your product docs:** website, help center, positioning or persona notes. If there are none, ask the person. You're looking for what the feature is for and what users struggled with before it. In the example, those struggles were rebuilding the same reports every week, not knowing which ads to make more of, and reporting to clients. In a fitness app, it might be not knowing what to train today.
3. **The launch material:** release notes, the PR or ticket, the changelog, the app store "What's new" text, a newsletter draft. In the example, the newsletter's three example prompts became the film's three beats.
4. **Users:** sales and onboarding call notes, support tickets, app reviews, community threads, and what people actually typed or tapped in the feature.

## 2. Write at least five candidates

For each candidate, write down:

- a title: verb + outcome, at most 4 words;
- the user's action: what they type, click or tap;
- why the user cares;
- the visible result.

## 3. Score them, keep three

| Test | Keep only if |
| --- | --- |
| Shipped | The app does it **today**, end to end. Not "coming soon". |
| Recognisable | A typical user does this job often and would recognise it in two seconds. |
| Visible | It shows as a change on screen you can describe in one sentence: a sort, a filter, a tag, a number, a chart, a new item, a message, or a state change (done, synced, booked). A claim like "it understands you" fails because there is nothing to see. |
| Quick | The action fits in about a second of typing, one click, or one tap or swipe. |
| Distinct | The three show different result patterns (not three filters). |
| Ladder | Ordered from simplest to most valuable. The last one ends in something the user would share, send, save or show off: a report, a playlist, an invoice, a booked slot, a shipped build. |

The result patterns that animate well are in `docs/NEW-LAUNCH.md` §0d.

## 4. If you can't get five good candidates: stop and ask

Don't invent use cases, and don't start the video. Send these questions to someone who knows the feature (the PM, the engineer who built it, support, sales). Get answers, then try again.

1. In one sentence, what can a user do now that they couldn't do last week?
2. Which platform is it on (web, iOS, Android, desktop, command line)? Does it look different on each?
3. Where does it live in the app? What's the exact button, gesture, menu item or command that starts it?
4. What are the three things people will do with it most in their first week?
5. What does the screen show when it works? What changes: a list, a number, a chart, a new item or document, a status, a notification, a message somewhere else?
6. Who is it for, and what were they doing before this existed?
7. Is any part of the flow unshipped, behind a feature flag, or limited to some plans? What must the video not show or claim?
8. Is there a demo account with realistic data? Can someone record the flow, or share screenshots of every state?
9. What one result would make a user say "I want that"?
10. Is there a review, support ticket, quote or call where someone asked for exactly this?
11. Where will the video run (website, social, app store preview, in-app, changelog)? In which aspect ratio, and by what date?

If the answers still give you fewer than three strong use cases, make a shorter film. Use two use cases and cut one title/action/product block on the beat grid. That's better than padding with a weak one.

## Mobile apps

The same three use cases and the same beats work. The actions are taps, swipes or short typed inputs. The results follow the same patterns: a list re-sorts, a card appears, a status flips. Plan for a portrait 9:16 film, or a phone frame on the 16:9 white stage. Keep the action beat on white just as big as on desktop: an isolated button, a single list row, or the input field on its own.
