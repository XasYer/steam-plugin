import { utils } from '#models'
import _ from 'lodash'

/**
 * 取消指定家庭群组的待定邀请
 * @param {string} accessToken
 * @param {number} familyGroupid
 * @param {string} steamidToCancel
 * @returns {Promise<unknown>}
 */
export async function CancelFamilyGroupInvite (accessToken, familyGroupid, steamidToCancel) {
  return utils.request.post('IFamilyGroupsService/CancelFamilyGroupInvite/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid_to_cancel: steamidToCancel
    }
  })
}

/**
 * ClearCooldownSkip
 * @param {string} accessToken
 * @param {string} steamid
 * @param {number} inviteId
 * @returns {Promise<unknown>}
 */
export async function ClearCooldownSkip (accessToken, steamid, inviteId) {
  return utils.request.post('IFamilyGroupsService/ClearCooldownSkip/v1', {
    params: {
      access_token: accessToken,
      steamid,
      invite_id: inviteId
    }
  })
}

/**
 * ConfirmInviteToFamilyGroup
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {number} inviteId
 * @param {number} nonce
 * @returns {Promise<unknown>}
 */
export async function ConfirmInviteToFamilyGroup (accessToken, familyGroupid, inviteId, nonce) {
  return utils.request.post('IFamilyGroupsService/ConfirmInviteToFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      invite_id: inviteId,
      nonce
    }
  })
}

/**
 * ConfirmInviteToFamilyGroup
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {number} inviteId
 * @param {number} nonce
 * @returns {Promise<unknown>}
 */
export async function ConfirmJoinFamilyGroup (accessToken, familyGroupid, inviteId, nonce) {
  return utils.request.post('IFamilyGroupsService/ConfirmJoinFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      invite_id: inviteId,
      nonce
    }
  })
}

/**
 * 创建家庭
 * @param {string} accessToken
 * @param {string} name
 * @param {string} steamid (Support only) User to create this family group for and add to the group.
 * @returns {Promise<unknown>}
 */
export async function CreateFamilyGroup (accessToken, name, steamid) {
  return utils.request.post('IFamilyGroupsService/CreateFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      name,
      steamid
    }
  })
}

/**
 * 删除家庭
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<unknown>}
 */
export async function DeleteFamilyGroup (accessToken, familyGroupid) {
  return utils.request.post('IFamilyGroupsService/DeleteFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  })
}

/**
 * ForceAcceptInvite
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function ForceAcceptInvite (accessToken, familyGroupid, steamid) {
  return utils.request.post('IFamilyGroupsService/ForceAcceptInvite/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid
    }
  })
}

/**
 * 查看家庭日志
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<{
 *   timestamp: string
 *   actor_steamid: string
 *   type: number
 *   body: string
 *   by_support: boolean
 * }[]>}
 */
export async function GetChangeLog (accessToken, familyGroupid) {
  return utils.request.get('IFamilyGroupsService/GetChangeLog/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  }).then(res => res.response?.changes || [])
}

/**
 * 查看家庭信息
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<{
 *   name: string
 *   members: {
 *     steamid: string
 *     role: number
 *     time_joined: number
 *     cooldown_seconds_remaining: number
 *   }[]
 *   free_spots: number
 *   country: string
 *   slot_cooldown_remaining_seconds: number
 *   slot_cooldown_overrides: number
 * }|undefined>}
 */
export async function GetFamilyGroup (accessToken, familyGroupid) {
  return utils.request.get('IFamilyGroupsService/GetFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * 查看家庭信息
 * @param {string} accessToken
 * @param {string} steamid
 * @returns {Promise<{
 *   family_groupid: string
 *   is_not_member_of_any_group: boolean
 *   latest_time_joined: number
 *   latest_joined_family_groupid: string
 *   role: number
 *   cooldown_seconds_remaining: number
 *   family_group: {
 *     name: string
 *     members: {
 *       steamid: string
 *       role: number
 *       time_joined: number
 *       cooldown_seconds_remaining: number
 *     }[]
 *     free_spots: number
 *     country: string
 *     slot_cooldown_remaining_seconds: number
 *     slot_cooldown_overrides: number
 *   }
 *   can_undelete_last_joined_family: boolean
 * }|undefined>}
 */
export async function GetFamilyGroupForUser (accessToken, steamid) {
  return utils.request.get('IFamilyGroupsService/GetFamilyGroupForUser/v1', {
    params: {
      access_token: accessToken,
      steamid,
      include_family_group_response: true
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * GetInviteCheckResults
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} steamid
 * @returns {Promise<unknown>}
*/
export async function GetInviteCheckResults (accessToken, familyGroupid, steamid) {
  return utils.request.get('IFamilyGroupsService/GetInviteCheckResults/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid
    }
  })
}

/**
 * Get the playtimes in all apps from the shared library for the whole family group.
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<{
 *   entries: {
 *     steamid: string
 *     appid: number
 *     first_played: number
 *     latest_played: number
 *     seconds_played: number
 *   }[]
 *   entries_by_owner: {
 *     steamid: string
 *     appid: number
 *     first_played: number
 *     latest_played: number
 *     seconds_played: number
 *   }[]
 * }|undefined>}
*/
export async function GetPlaytimeSummary (accessToken, familyGroupid) {
  return utils.request.post('IFamilyGroupsService/GetPlaytimeSummary/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * GetPreferredLenders
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<{
 *   steamid: string
 * }[]>}
 */
export async function GetPreferredLenders (accessToken, familyGroupid) {
  return utils.request.get('IFamilyGroupsService/GetPreferredLenders/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  }).then(res => res.response?.members || [])
}

/**
 * 获得家庭库的游戏列表
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} steamid
 * @returns {Promise<{
 *   apps: {
 *     appid: number
 *     owner_steamids: string[]
 *     name: string
 *     capsule_filename: string
 *     img_icon_hash: string
 *     exclude_reason: number
 *     rt_time_acquired: number
 *     rt_last_played: number
 *     rt_playtime: number
 *     app_type: number
 *     content_descriptors: number[]
 *   }[]
 *   owner_steamid: string
 * }|undefined>}
 */
export async function GetSharedLibraryApps (accessToken, familyGroupid, steamid) {
  return utils.request.get('IFamilyGroupsService/GetSharedLibraryApps/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid,
      include_own: true
    }
  }).then(res => _.isEmpty(res.response) ? undefined : res.response)
}

/**
 * 邀请加入家庭
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} receiverSteamid
 * @param {number} receiverRole 1是成人
 * @returns {Promise<unknown>}
 */
export async function InviteToFamilyGroup (accessToken, familyGroupid, receiverSteamid, receiverRole = 1) {
  return utils.request.post('IFamilyGroupsService/InviteToFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      receiver_steamid: receiverSteamid,
      receiver_role: receiverRole
    }
  })
}

/**
 * 加入指定的家庭
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {number} nonce
 * @returns {Promise<unknown>}
 */
export async function JoinFamilyGroup (accessToken, familyGroupid, nonce) {
  return utils.request.post('IFamilyGroupsService/JoinFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      nonce
    }
  })
}

/**
 * 修改家庭名字
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {number} name
 * @returns {Promise<unknown>}
 */
export async function ModifyFamilyGroupDetails (accessToken, familyGroupid, name) {
  return utils.request.post('IFamilyGroupsService/ModifyFamilyGroupDetails/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      name
    }
  })
}

/**
 * 从指定的家庭组中删除指定的帐户
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} steamidToRemove
 * @returns {Promise<unknown>}
 */
export async function RemoveFromFamilyGroup (accessToken, familyGroupid, steamidToRemove) {
  return utils.request.post('IFamilyGroupsService/RemoveFromFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid_to_remove: steamidToRemove
    }
  })
}

/**
 * 重新发送邀请
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {string} steamid
 * @returns {Promise<unknown>}
 */
export async function ResendInvitationToFamilyGroup (accessToken, familyGroupid, steamid) {
  return utils.request.post('IFamilyGroupsService/ResendInvitationToFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      steamid
    }
  })
}

/**
 * SetPreferredLender
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @param {number} appid
 * @param {string} lenderSteamid
 * @returns {Promise<unknown>}
 */
export async function SetPreferredLender (accessToken, familyGroupid, appid, lenderSteamid) {
  return utils.request.post('IFamilyGroupsService/SetPreferredLender/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid,
      appid,
      lender_steamid: lenderSteamid
    }
  })
}

/**
 * SetPreferredLender
 * @param {string} accessToken
 * @param {string} familyGroupid
 * @returns {Promise<unknown>}
 */
export async function UndeleteFamilyGroup (accessToken, familyGroupid) {
  return utils.request.post('IFamilyGroupsService/UndeleteFamilyGroup/v1', {
    params: {
      access_token: accessToken,
      family_groupid: familyGroupid
    }
  })
}
