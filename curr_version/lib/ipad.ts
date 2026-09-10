/**
 * The iPad the student screens are designed on: a 1180 × 820 logical-point landscape screen inside
 * a 22 px bezel, with the margin `IpadStage` keeps around the device when it scales to fit.
 * Shared by the stage and by the split view, which lays the student pane out at this width.
 */
export const SCREEN_W = 1180;
export const SCREEN_H = 820;
export const BEZEL = 22;
export const DEVICE_W = SCREEN_W + BEZEL * 2;
export const DEVICE_H = SCREEN_H + BEZEL * 2;
export const STAGE_MARGIN = 40;
