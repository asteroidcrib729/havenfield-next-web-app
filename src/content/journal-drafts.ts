import type { BlogPostInput } from "@/lib/blog-types";
import { visualAlt } from "./visuals";
const drafts = [
  {
    slug: "daylight-through-the-seasons",
    title: "Daylight through the seasons",
    excerpt: "Look beyond one bright photograph and build a more useful picture of light at home.",
    category: "Design notes",
    tags: ["Daylight", "Architecture"],
    image: "courtyard-living",
    body: "A room can feel entirely different after the sun has moved. A photograph records one moment; living asks more of a space. Before choosing a favorite window, think about when you will actually use the room.\n\n## Observe a routine, not a perfect hour\n\nStart with breakfast, work and the evening meal. Which spaces need clear daylight at those times? Note the window direction and what sits outside it. A neighboring wall, mature tree or deep balcony may matter as much as the size of the glass.\n\nMake a simple note of what you observed and what you only expect. A sunny visit does not establish year-round comfort, and a grey day does not make every room dark.\n\n## Leave room for adjustment\n\nConsider where a desk, chair or table could move as the light changes. Look for useful shading and ask how it works before assuming a blind or canopy is included. A comfortable place to sit away from direct sun can be just as valuable as the brightest corner.\n\nNotice whether open doors connect light between rooms. A small change in furniture placement may keep that borrowed light useful without rebuilding anything.\n\n## Return with better questions\n\nIf possible, revisit at another time. Ask for the actual window orientation and how the room is shaded. Keep questions about building performance for someone qualified to assess the real property.\n\nThe Courtyard House and Woodland Pavilion explore two invented approaches: inward-facing courtyard light and filtered views through trees. Their images are design concepts, not a measured daylight study.",
  },
  {
    slug: "a-room-that-can-change-its-mind",
    title: "A room that can change its mind",
    excerpt:
      "A flexible work space begins with ordinary proportions, useful storage and a way to put the day away.",
    category: "Living well",
    tags: ["Interiors", "Flexible living"],
    image: "atelier-workroom",
    body: "A flexible room does not have to perform every task at once. It needs a clear way to change from one use to another without turning the rest of the home into storage.\n\nBegin with the activity you do most often. A desk used every weekday deserves a realistic place, rather than an optimistic corner that only works before someone sits down.\n\n## Give work a boundary\n\nA door is one option, but so are a movable screen, a separate table or storage that closes. Think about sound and interruptions as well as the view behind a video call. Test the arrangement with another person using the adjacent room.\n\nKeep cables and everyday tools close to where they are used. A work surface that takes twenty minutes to clear is unlikely to become a relaxed dinner table each evening.\n\n## Choose furniture by its second use\n\nAn ordinary table can support a meal and a project. A comfortable chair can move to a reading corner. Measure the route around each item and leave room to pull out a seat.\n\nAvoid relying on furniture symbols in a marketing drawing. Draw your own approximate arrangement with the dimensions you actually need, then verify it against the space.\n\n## Make the reset easy\n\nDecide what happens at the end of the working day. A shelf for the notebook and a cupboard for the laptop may be more useful than adding another desk.\n\nAtelier Loft uses this idea in its fictional work and dining room. The aim is a home that can change purpose while still feeling settled; the concept does not promise acoustic performance or a particular work setup.",
  },
  {
    slug: "planting-for-an-unhurried-garden",
    title: "Planting for an unhurried garden",
    excerpt:
      "A smaller planting palette and clear routes can make an outdoor space easier to understand and care for.",
    category: "Living well",
    tags: ["Gardens", "Materials"],
    image: "amenities-garden",
    body: "A quiet garden often begins with a few decisions made well: where to sit, how to reach it, and who will care for the planting. More species and more features do not automatically make the space more useful.\n\nStart with the parts of the garden you expect to use through an ordinary week. Leave the decorative wish list until those routes and places are clear.\n\n## Plan the space before the planting\n\nMark the way from the door to a seat, storage and any shared entrance. Keep those routes easy to follow. Think about where chairs move when people gather and how tools will reach the planting beds.\n\nA sheltered bench can make a small garden feel complete. It needs a practical setting, rather than being squeezed into the last available corner.\n\n## Ask local questions\n\nPlant suitability depends on climate, exposure, soil and water. A photograph cannot tell you what will thrive in your own garden. Ask a knowledgeable local grower about a short list of plants rather than copying a whole scene.\n\nLow maintenance still means maintenance. Establishing plants, managing fallen leaves and keeping paths clear take time. Choose a scale of garden that matches the care available.\n\n## Understand shared responsibility\n\nFor a communal garden, find out who looks after it and how access is arranged. Keep observed conditions separate from promises about future upkeep.\n\nHavenfield's planted courtyard and woodland deck are fictional landscape studies. They illustrate proportion and atmosphere; they are not planting specifications, irrigation plans or claims that a particular species will suit every location.",
  },
  {
    slug: "read-a-floor-plan-in-everyday-routes",
    title: "Read a floor plan in everyday routes",
    excerpt:
      "Trace groceries, laundry and guests through a plan before judging it by the total area.",
    category: "Field guide",
    tags: ["Architecture", "Home search"],
    image: "journal-plan",
    body: "The most revealing line on a floor plan may be the one you draw yourself. Trace a route from the entrance to the kitchen, then from the bedroom to the laundry. These everyday journeys can explain more than a headline area figure.\n\nUse the drawing as a set of questions. Its dimensions and symbols still need to be checked against the actual place.\n\n## Arrive with something in your hands\n\nImagine carrying shopping through the front door. Where do shoes and bags go? Can you reach the kitchen without crossing the main seating arrangement? Look for practical storage close to the point of use.\n\nA hallway is not automatically wasted space. It can separate private rooms from shared ones. What matters is whether that separation helps the people who will live there.\n\n## Follow two routines at once\n\nThink about one person cooking while another takes a call. Consider a visitor arriving while a bedroom is in use. Notice which doors provide separation and which routes depend on walking through another room.\n\nMark door swings and the space needed to pull out chairs. Furniture drawn in a brochure may be smaller than the furniture you own.\n\n## Check what the drawing omits\n\nA plan may not explain changes in floor level, window height, services or sound. Make a short list of anything that affects your routine and ask for clarification.\n\nWoodland Pavilion and Atelier Loft offer contrasting fictional layouts: a ground-floor pavilion and a compact conversion. Their illustrative areas do not replace a measured plan or a professional assessment of a real building.",
  },
  {
    slug: "small-spaces-with-room-to-live",
    title: "Small spaces with room to live",
    excerpt:
      "Useful proportions, deliberate storage and a few clear routes can give a compact home a calmer rhythm.",
    category: "Design notes",
    tags: ["Interiors", "Flexible living"],
    image: "journal-everyday",
    body: "A compact home asks you to be specific about what matters. It can also make ordinary routines easier when the things you use are close to hand. The goal is not to disguise the size of a room; it is to use the space honestly.\n\nBegin with what already belongs in your day. A table for two used every morning may deserve more attention than occasional seating for a large gathering.\n\n## Keep a clear route\n\nPlace the largest items first and leave a practical route between doors, windows and the main furniture. A narrow gap can make an otherwise generous room frustrating to use.\n\nMeasure storage with the same care as a sofa. A cupboard needs space to open and a useful depth for the things it holds. More shelving is not always the answer if it makes the room harder to move through.\n\n## Give objects a home\n\nGroup everyday items near the activity they support. Books belong near the reading chair; cups should be easy to reach from the place you make a drink. This reduces the number of surfaces that become temporary storage.\n\nLeave some space unassigned. A room can accommodate change more easily when every corner is not already committed.\n\n## Value the connection beyond the room\n\nA garden view or a useful shared outdoor space can add variety to a compact home, but it does not increase the measured interior area.\n\nAtelier Loft explores two bedrooms within an illustrative 142 m². Its flexible work area and shared roof garden are invented design features, not a claim that one layout suits every household.",
  },
  {
    slug: "a-viewing-checklist-you-will-actually-use",
    title: "A viewing checklist you will actually use",
    excerpt:
      "Keep observations, unanswered questions and personal priorities separate in a short, repeatable checklist.",
    category: "Field guide",
    tags: ["Viewings", "Home search"],
    image: "journal-viewing",
    body: "A useful viewing checklist should be short enough to use while standing in a room. Its purpose is to help you remember what matters and compare observations afterward, rather than turn a visit into an inspection you are not qualified to perform.\n\nChoose a few priorities before arriving. Keep the same headings for each home so that the latest visit does not automatically become the most memorable.\n\n## Before the visit\n\nConfirm access arrangements and ask whether photographs or measurements are allowed. If steps, door widths or parking affect your visit, ask about them in advance.\n\nBring the dimensions of the furniture you intend to keep. Record questions that could change your decision, rather than trying to list every possible feature.\n\n## In each room\n\nWrite one observation about light, one about movement and one about storage. Note what you can see directly. Put statements that need checking in a separate question list.\n\nLook at the route between spaces as well as the rooms themselves. Ask before opening cupboards or operating fixtures. Visible marks or damage deserve an explanation, not an immediate diagnosis.\n\n## Immediately afterward\n\nRecord three strengths and three compromises while the visit is fresh. Note who will answer each outstanding question and whether you need written confirmation.\n\nA checklist supports a considered conversation. It cannot establish ownership, condition, costs or legal suitability for a real transaction.\n\nHavenfield's inquiry form demonstrates a stored demo receipt only. It does not arrange an appointment, and the homes used in these examples are fictional. Use invented details if you try the workflow.",
  },
];
export const journalDrafts: BlogPostInput[] = drafts.map(({ image, ...draft }) => {
  const coverImage = `/media/plan03/${image}.webp`;
  return {
    ...draft,
    author: "Havenfield Editorial",
    coverImage,
    coverAlt: visualAlt[coverImage],
    status: "draft",
    publishedAt: null,
    seoTitle: `${draft.title} | Havenfield`,
    seoDescription: draft.excerpt,
    canonicalUrl: "",
    noindex: true,
  };
});
