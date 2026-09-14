/**
 * The create flow's floating action bar (Continue, Assess set, Finalise set, Back and Create), bottom-right over the page,
 * and the clearance every step leaves under its content for it (ticket 272). The bar floats over whatever scrolls beneath
 * it; the clearance is the bar's whole reach above the window's bottom edge, its `bottom-16` (4rem) plus a size-lg button
 * (`py-3` and a 15 px line, 3rem), so at the end of the scroll the last card's last row always sits clear of it, whatever
 * height the teacher frame's presenter strip takes. Change one and the other with it.
 */
export const CREATE_BAR = "fixed bottom-16 right-6 z-30 flex items-center gap-3";
export const CREATE_BAR_CLEARANCE = "pb-28";
