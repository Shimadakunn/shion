/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as categories from "../categories.js";
import type * as emails from "../emails.js";
import type * as formules from "../formules.js";
import type * as menu from "../menu.js";
import type * as reservations from "../reservations.js";
import type * as schedule from "../schedule.js";
import type * as settings from "../settings.js";
import type * as subcategories from "../subcategories.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  emails: typeof emails;
  formules: typeof formules;
  menu: typeof menu;
  reservations: typeof reservations;
  schedule: typeof schedule;
  settings: typeof settings;
  subcategories: typeof subcategories;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
