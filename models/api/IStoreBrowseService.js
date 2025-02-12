import { utils } from '#models'
import _ from 'lodash'

/**
 * 获取多个appid的游戏信息
 * @param {{
 *   appid?:string
 *   packageid?:string
 *   bundleid?:string
 *   tagid?:string
 *   creatorid?:string
 *   hubcategoryid?:string
 * }[]|string[]} appids
 * @param {{
 *   include_assets: boolean,
 *   include_release: boolean,
 *   include_platforms: boolean,
 *   include_all_purchase_options: boolean,
 *   include_screenshots: boolean,
 *   include_trailers: boolean,
 *   include_ratings: boolean,
 *   include_reviews: boolean,
 *   include_tag_count: count
 *   include_basic_info: boolean,
 *   include_supported_languages: boolean,
 *   include_full_description: boolean,
 *   include_included_items: boolean,
 *   include_assets_without_overrides: boolean,
 *   apply_user_filters: boolean,
 *   include_links: boolean,
 * }} options
 * @returns {Promise<{
 *   [appid: string | number] : {
 *     item_type: number,
 *     id: number,
 *     success: boolean,
 *     visible: boolean,
 *     name: string,
 *     store_url_path: string,
 *     appid: number,
 *     type: number,
 *     is_free?: boolean,
 *     categories: {
 *       supported_player_categoryids: number[],
 *       feature_categoryids: number[],
 *       controller_categoryids: number[],
 *     },
 *     reviews?: {
 *       summary_filtered: {
 *         review_count: number,
 *         percent_positive: number,
 *         review_score: number,
 *         review_score_label: string,
 *       }
 *     },
 *     included_appids?: number[],
 *     basic_info?: {
 *       short_description: string,
 *       publishers: {
 *         name: string,
 *         creator_clan_account_id: number,
 *       }[],
 *       developers: {
 *         name: string,
 *         creator_clan_account_id: number,
 *       }[],
 *       capsule_headline: string,
 *     },
 *     tagids: number[],
 *     assets?: {
 *       asset_url_format: string,
 *       main_capsule: string,
 *       small_capsule: string,
 *       header: string,
 *       page_background: string,
 *       hero_capsule: string,
 *       library_capsule: string,
 *       library_capsule_2x: string,
 *       library_hero: string,
 *       community_icon: string,
 *     },
 *     release?: {
 *       is_coming_soon: boolean,
 *       custom_release_date_message: string,
 *       coming_soon_display: string,
 *       steam_release_date: number,
 *     },
 *     platforms?: {
 *       windows: boolean,
 *       mac: boolean,
 *       steamos_linux: boolean,
 *       vr_support: {},
 *       steam_deck_compat_category: number,
 *     },
 *     best_purchase_option?: {
 *       packageid?: number,
 *       bundleid?: number,
 *       purchase_option_name: string,
 *       final_price_in_cents: string,
 *       original_price_in_cents: string,
 *       formatted_final_price: string,
 *       formatted_original_price: string,
 *       discount_pct: number,
 *       active_discounts: {
 *         discount_amount: string,
 *         discount_description: string,
 *         discount_end_date: number
 *       },
 *     },
 *     purchase_options?: {
 *       packageid: number,
 *       purchase_option_name: string,
 *       final_price_in_cents: string,
 *       formatted_final_price: string,
 *       user_can_purchase_as_gift: boolean,
 *       hide_discount_pct_for_compliance: boolean,
 *       included_game_count: number,
 *     }[],
 *     screenshots?: {
 *       all_ages_screenshots: {
 *         filename: string,
 *         ordinal: number,
 *       }[]
 *     },
 *     trailers?: {
 *       highlights: {
 *         trailer_name: string,
 *         trailer_url_format: string,
 *         trailer_category: number,
 *         trailer_480p: {
 *           filename: string,
 *           type: string,
 *         }[],
 *         trailer_max: {
 *           filename: string,
 *           type: string,
 *         }[],
 *         microtrailer: {
 *           filename: string,
 *           type: string,
 *         }[],
 *         screenshot_medium: string
 *         screenshot_full: string
 *         trailer_base_id: number
 *       }[],
 *     },
 *     supported_languages?: {
 *       elanguage: number,
 *       eadditionallanguage: number,
 *       supported: boolean,
 *       full_audio: boolean,
 *       subtitles: boolean,
 *     }[]
 *     full_description?: string,
 *     assets_without_overrides?: {
 *       asset_url_format: string,
 *       main_capsule: string,
 *       small_capsule: string,
 *       header: string,
 *       page_background: string,
 *       hero_capsule: string,
 *       library_capsule: string,
 *       library_capsule_2x: string,
 *       library_hero: string,
 *       community_icon: string,
 *     },
 *     user_filter_failure?: {
 *       filter_failure: number,
 *       already_owned: boolean,
 *     },
 *     links?: {
 *       link_type: number,
 *       url: string,
 *     }[]
 *     user_can_purchase_as_gift: boolean,
 *     hide_discount_pct_for_compliance: boolean,
 *     included_game_count: number,
 *   }
 * }>}
 */
export async function GetItems (appids, options = {}) {
  if (!Array.isArray(appids)) appids = [appids]
  const data = {
    ids: appids.map(appid => {
      if (typeof appid !== 'object') {
        return { appid }
      } else {
        return appid
      }
    }),
    country_code: 'CN',
    context: {
      language: 'schinese',
      country_code: 'CN'
    },
    data_request: options
  }
  return utils.request.get('IStoreBrowseService/GetItems/v1', {
    params: {
      input_json: JSON.stringify(data)
    }
  }).then(res => {
    const data = res.response.store_items || []
    return _.keyBy(data, i => i.success === 1 ? i.id : 0)
  })
}

/**
 * Get category definitions for store. This is a public-facing API (as compared to StoreCatalog.GetCategories, which is intended for PHP)
 * @returns {Promise<{
 *   categoryid: number
 *   type: number
 *   internal_name: string
 *   display_name: string
 *   image_url: string
 *   computed: boolean
 *   edit_url: string
 *   edit_sort_order: number
 * }[]>}
 */
export async function GetStoreCategories () {
  return utils.request.get('IStoreBrowseService/GetStoreCategories/v1').then(res => res.response.categories)
}
