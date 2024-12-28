import { utils } from '#models'

/**
 * GetFriendsRecommendedApp
 * @returns {Promise<unknown>}
 */
export async function GetFriendsRecommendedApp () {
  return utils.request.get('IUserReviewsService/GetFriendsRecommendedApp/v1')
}
