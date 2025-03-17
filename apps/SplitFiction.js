import { App, Render, Version } from '#components'
import { api, utils } from '#models'
import { join } from 'path'
import axios from 'axios'

const appInfo = {
  id: 'SplitFiction',
  name: '双影奇境存档分析'
}

const rule = {
  saveData: {
    reg: App.getReg('(双影奇境|SplitFiction)(存档)?(数据|data)'),
    cfg: {
      tips: true,
      accessToken: true
    },
    fnc: async (e, { cookie, uid, steamId }) => {
      const html = await api.store.remotestorageapp(cookie, 2001120)
      const bodyReg = /<tbody>([\s\S]*)<\/tbody>/
      const body = (bodyReg.exec(html)?.[1] || '').split('</tr>').find(i => i.includes('SplitFiction/SaveData.Split'))
      if (!body) return 'Steam云存档中没有找到双影奇境的存档数据哦,先上传到Steam云存档吧'
      const urlReg = /<a\s*href="(.*)">/
      const url = urlReg.exec(body)[1]
      const data = (await axios.get(url)).data
      const nickname = await utils.bot.getUserName(e.self_id, uid, e.group_id)
      const profileCounter = [
        `总跳跃次数: ${data['ProfileCounter.TotalJumps']}`
      ]
      if (data['ProfileCounter.TrickPointsZoe']) {
        profileCounter.push(`战争坡道分数(佐伊): ${data['ProfileCounter.TrickPointsZoe']}`)
      }
      if (data['ProfileCounter.TrickPointsMio']) {
        profileCounter.push(`战争坡道分数(米欧): ${data['ProfileCounter.TrickPointsMio']}`)
      }
      const imgPath = join(Version.pluginPath, 'resources', 'SplitFiction')
      // 最后一次保存位置
      const lastSaveChapterMap = map[data.LastSaveChapter]
      // 最远到达位置
      const furthestUnlockedChapter = map[data.FurthestUnlockedChapter]
      // 支线收集
      let completeBranch = 0
      const branchLine = branchMapKeys.map(key => {
        const flag = data[`SideContent.Complete.${key}`]
        const i = map[key]
        if (flag) completeBranch++
        return {
          name: i.name,
          appid: `解锁位置: ${i.chapter}-${i.scene}`,
          desc: flag ? '已收集' : '未收集',
          descBgColor: flag ? '#beee11' : '#999999',
          image: join(imgPath, i.name + '.png')
        }
      })
      // 获取一下成就
      const complateAchievement = []
      const unComplateAchievement = []
      const userAchievement = await api.ISteamUserStats.GetUserStatsForGame(2001120, steamId).catch(() => {})
      if (userAchievement?.achievements?.length) {
        const schema = await api.ISteamUserStats.GetSchemaForGame(2001120).catch(() => {})
        const gameAchievement = schema?.availableGameStats?.achievements || []
        for (const i of gameAchievement) {
          const user = userAchievement.achievements.find(u => u.name === i.name)
          const info = {
            name: i.displayName,
            desc: i.hidden ? '已隐藏' : i.description,
            image: user ? i.icon : i.icongray,
            isAvatar: true
          }
          if (user) {
            complateAchievement.push(info)
          } else {
            unComplateAchievement.push(info)
          }
        }
      }
      const screenshotOptions = [
        {
          title: `${nickname}的双影奇境存档数据`,
          desc: profileCounter,
          games: [
            {
              name: lastSaveChapterMap.name,
              appid: `${lastSaveChapterMap.chapter}-${lastSaveChapterMap.scene}`,
              desc: '最后一次保存',
              image: join(imgPath, lastSaveChapterMap.name + '.png')
            },
            {
              name: furthestUnlockedChapter.name,
              appid: `${furthestUnlockedChapter.chapter}-${furthestUnlockedChapter.scene}`,
              desc: '历史最高章节',
              image: join(imgPath, furthestUnlockedChapter.name + '.png')
            }
          ]
        },
        {
          title: `支线收集 ${completeBranch}/12`,
          games: branchLine
        }
      ]
      if (complateAchievement.length) {
        const achievementLength = complateAchievement.length + unComplateAchievement.length
        screenshotOptions.push(
          {
            title: `已完成成就 ${complateAchievement.length}/${achievementLength}`,
            games: complateAchievement
          },
          {
            title: `未完成成就 ${unComplateAchievement.length}/${achievementLength}`,
            games: unComplateAchievement
          }
        )
      }
      return await Render.render('inventory/index', {
        data: screenshotOptions
      })
    }
  }
}

export const app = new App(appInfo, rule).create()

const map = {
  // 第一章 雷德出版社
  '/Game/Maps/Tutorial/Tomb/Tomb_BP##TombStart': {
    name: '自由斗士',
    chapter: 1,
    scene: 1
  },
  '/Game/Maps/Tutorial/Village/Village_BP##Intro': {
    name: '勇武骑士',
    chapter: 1,
    scene: 2
  },

  // 第二章 霓虹复仇
  '/Game/Maps/Skyline/Highway/Skyline_Highway_Tutorial_BP##Tutorial': {
    name: '高峰时间',
    chapter: 2,
    scene: 1
  },
  '/Game/Maps/Skyline/DaClub/Skyline_DaClub_BP##DaClub Finding Sandfish': {
    name: '电音律动',
    chapter: 2,
    scene: 2
  },
  '/Game/Maps/Desert/Desert/Desert_SandFish_BP##Intro': {
    name: '沙鱼传奇',
    chapter: 2,
    scene: 2,
    branch: true
  },
  '/Game/Maps/Skyline/Nightclub/Skyline_Nightclub_Club_BP##Club Combat Entry': {
    name: '你好，锤子先生',
    chapter: 2,
    scene: 3
  },
  '/Game/Maps/Skyline/Nightclub/Skyline_Nightclub_Alley_BP##Alley 0 - Start': {
    name: '霓虹街道',
    chapter: 2,
    scene: 4
  },
  '/Game/Maps/PigWorld/PigWorld_BP##Pigsty_Intro': {
    name: '农场生活',
    chapter: 2,
    scene: 4,
    branch: true
  },
  '/Game/Maps/Skyline/CarTower/Skyline_CarTower_BP##BallBoss_Chase_Intro': {
    name: '停车场',
    chapter: 2,
    scene: 5
  },
  '/Game/Maps/Skyline/Chase/Skyline_Chase_Tutorial_BP##Chase_Alley_Start': {
    name: '驾车逃离',
    chapter: 2,
    scene: 6
  },
  '/Game/Maps/Skyline/InnerCity/Skyline_InnerCity_CarCrash_BP##CarCrash Site': {
    name: '大都市生活',
    chapter: 2,
    scene: 7
  },
  '/Game/Maps/Summit/Giants/Summit_Giants_BP##IntroTraversalArea': {
    name: '登山远足',
    chapter: 2,
    scene: 7,
    branch: true
  },
  '/Game/Maps/Skyline/InnerCity/Skyline_InnerCity_Limbo_BP##Limbo Intro': {
    name: '翻转都市',
    chapter: 2,
    scene: 8
  },
  '/Game/Maps/Skyline/GravityBike/Skyline_GravityBike_Tutorial_BP##Intro': {
    name: '重力摩托',
    chapter: 2,
    scene: 9
  },
  '/Game/Maps/Skyline/Boss/Skyline_Boss_Tutorial_BP##BikeTutorial 1': {
    name: '攀登摩天楼',
    chapter: 2,
    scene: 10
  },
  '/Game/Maps/Skyline/Boss/Skyline_Boss_V2_BP##Tank Phase 1': {
    name: '犯罪集团首领',
    chapter: 2,
    scene: 11
  },

  // 第三章 春之希冀
  '/Game/Maps/Tundra/Crack/Swamp/Tundra_Crack_Swamp_BP##Swamp_Caves': {
    name: '地下世界',
    chapter: 3,
    scene: 1
  },
  '/Game/Maps/Tundra/Crack/Swamp/Tundra_Crack_Swamp_BP##Swamp_Wetlands': {
    name: '长青领主',
    chapter: 3,
    scene: 2
  },
  '/Game/Maps/Coast/TwistyTrain/Coast_TwistyTrain_BP##WingsuitIntro': {
    name: '列车劫案',
    chapter: 3,
    scene: 2,
    branch: true
  },
  '/Game/Maps/Tundra/Crack/Evergreen/Tundra_Crack_Evergreen_BP##Evergreen_Inside': {
    name: '森林之心',
    chapter: 3,
    scene: 3
  },
  '/Game/Maps/Tundra/Crack/EvergreenSide/Tundra_Crack_EvergreenSide_BP##SideSectionStart': {
    name: '大地之母',
    chapter: 3,
    scene: 4
  },
  '/Game/Maps/Tundra/Crack/Forest/Tundra_Crack_Forest_BP##CreepyForest': {
    name: '毁灭性的移动树干',
    chapter: 3,
    scene: 5
  },
  '/Game/Maps/GameShowArena/GameShowArena_BP##GameShowArena - Start': {
    name: '节目游戏',
    chapter: 3,
    scene: 5,
    branch: true
  },
  '/Game/Maps/Tundra/River/Tundra_River_MonkeyRealm/Tundra_River_MonkeyRealm_BP##MountainPath': {
    name: '蠢猴子',
    chapter: 3,
    scene: 6
  },
  '/Game/Maps/Tundra/River/Tundra_River_MonkeyRealm/Tundra_River_MonkeyRealm_BP##MonkeyConga': {
    name: '三人探戈',
    chapter: 3,
    scene: 7
  },
  '/Game/Maps/Tundra/River/Tundra_River_IcePalace/Tundra_River_IcePalace_BP##IcePalace - Start': {
    name: '冰封殿堂',
    chapter: 3,
    scene: 8
  },
  '/Game/Maps/SolarFlare/SolarFlare_BP##SolarFlare_Intro': {
    name: '塌缩之星',
    chapter: 3,
    scene: 8,
    branch: true
  },
  '/Game/Maps/Tundra/River/Tundra_River_IcePalace/Tundra_River_IcePalace_BP##IceKing - Phase01': {
    name: '冰封之王',
    chapter: 3,
    scene: 9
  },

  // 第四章 最终黎明
  '/Game/Maps/Island/Entrance/Island_Entrance_BP##Skydive': {
    name: '运输船',
    chapter: 4,
    scene: 1
  },
  '/Game/Maps/Island/Stormdrain/Island_Stormdrain_BP##Start': {
    name: '潜入行动',
    chapter: 4,
    scene: 2
  },
  '/Game/Maps/Island/Stormdrain/Island_Stormdrain_BP##WeaponUpgradeStation': {
    name: '枪械升级',
    chapter: 4,
    scene: 3
  },
  '/Game/Maps/Island/Stormdrain/Island_Stormdrain_BP##SpinningHallway': {
    name: '毒液滚筒',
    chapter: 4,
    scene: 4
  },
  '/Game/Maps/KiteTown/KiteTown_BP##Intro': {
    name: '风筝',
    chapter: 4,
    scene: 4,
    branch: true
  },
  '/Game/Maps/Island/Rift/Island_Rift_BP##Hallway': {
    name: '工厂入口',
    chapter: 4,
    scene: 5
  },
  '/Game/Maps/Island/Rift/Island_Rift_BP##Cable House': {
    name: '工厂外围',
    chapter: 4,
    scene: 6
  },
  '/Game/Maps/Island/Rift/Island_Rift_BP##Walker Arena': {
    name: '实验室',
    chapter: 4,
    scene: 7
  },
  '/Game/Maps/MoonMarket/MoonMarket_BP##Intro': {
    name: '月亮市集',
    chapter: 4,
    scene: 7,
    branch: true
  },
  '/Game/Maps/Island/Tower/Island_Tower_Sidescroller_BP##Sidescroller_Intro': {
    name: '机动战术',
    chapter: 4,
    scene: 8
  },
  '/Game/Maps/Island/Tower/Island_Tower_Sidescroller_BossFight_BP##Overseer_Entry': {
    name: '监督者',
    chapter: 4,
    scene: 9
  },
  '/Game/Maps/Island/Tower/Island_Tower_Sidescroller_Jetpack_BP##Jetpack_Tutorial': {
    name: '空中亡命',
    chapter: 4,
    scene: 10
  },
  '/Game/Maps/Sketchbook/Sketchbook_BP##Intro': {
    name: '笔记本',
    chapter: 4,
    scene: 10,
    branch: true
  },
  '/Game/Maps/Island/Escape/Island_Escape_BP##Inner Tower': {
    name: '大逃亡',
    chapter: 4,
    scene: 11
  },
  '/Game/Maps/RedSpace/RedSpace_BP##BeforeRedspace': {
    name: '系统安全模式',
    chapter: 4,
    scene: 12
  },

  // 第五章 龙族国度之崛起
  '/Game/Maps/Summit/EggPath/Summit_EggPath_BP##Entrance': {
    name: '蜿蜒小路',
    chapter: 5,
    scene: 1
  },
  '/Game/Maps/Summit/WaterTempleInner/Summit_WaterTempleInner_Raft_BP##SlowRaftStart': {
    name: '水之庙',
    chapter: 5,
    scene: 2
  },
  '/Game/Maps/Battlefield/Battlefield_BP##Battlefield_Intro': {
    name: '战争坡道',
    chapter: 5,
    scene: 2,
    branch: true
  },
  '/Game/Maps/Summit/CraftApproach/Summit_CraftApproach_BP##Water Volcano': {
    name: '龙骑士大团结',
    chapter: 5,
    scene: 3
  },
  '/Game/Maps/Summit/CraftApproach/Summit_CraftApproach_RubyKnight_BP##Ruby Knight Intro': {
    name: '屠龙者',
    chapter: 5,
    scene: 4
  },
  '/Game/Maps/Summit/CraftTemple/Summit_CraftTemple_BP##CraftTemple_Start': {
    name: '工艺之庙',
    chapter: 5,
    scene: 5
  },
  '/Game/Maps/SpaceWalk/SpaceWalk_BP##SpaceWalk_Indoor': {
    name: '太空逃生',
    chapter: 5,
    scene: 5,
    branch: true
  },
  '/Game/Maps/Summit/CraftTemple/Summit_CraftTemple_BP##CraftTemple_DarkCaveEntrance': {
    name: '龙魂',
    chapter: 5,
    scene: 6
  },
  '/Game/Maps/Summit/TreasureTemple/Summit_TreasureTemple_BP##Gauntlet': {
    name: '宝藏之庙',
    chapter: 5,
    scene: 7
  },
  '/Game/Maps/Dentist/DentistNightmare_BP##Intro': {
    name: '生日蛋糕',
    chapter: 5,
    scene: 7,
    branch: true
  },
  '/Game/Maps/Summit/TreasureTemple/Summit_TreasureTemple_BP##TopDown': {
    name: '皇宫',
    chapter: 5,
    scene: 8
  },
  '/Game/Maps/Summit/TreasureTemple/Summit_TreasureTemple_BP##Decimator': {
    name: '宝藏叛徒',
    chapter: 5,
    scene: 9
  },
  '/Game/Maps/Summit/StormSiegeIntro/Summit_StormSiegeIntro_BP##Intro_Tutorial': {
    name: '神威之龙',
    chapter: 5,
    scene: 10
  },
  '/Game/Maps/Summit/StormSiegeStoneBeast/Summit_StormSiegeChase_BP##Intro': {
    name: '深入风暴',
    chapter: 5,
    scene: 11
  },
  '/Game/Maps/Summit/StormSiegeStoneBeast/Summit_StormSiegeFinale_BP##Summit_StormSiegeFinale_FallingDebris': {
    name: '巨石之怒',
    chapter: 5,
    scene: 12
  },

  // 第六章 孤立
  '/Game/Maps/Prison/Intro_BP##Outside_LevelStart': {
    name: '监狱飞船',
    chapter: 6,
    scene: 1
  },
  '/Game/Maps/Prison/Drones/Maintenance/Prison_Drones_Maintenance_BP##Drones_LevelStart': {
    name: '实用无人机',
    chapter: 6,
    scene: 2
  },
  '/Game/Maps/Prison/Drones/ShipInBetween/Prison_Drones_InBetween_01_BP##InBetween_Slide': {
    name: '坠入奇境',
    chapter: 6,
    scene: 3
  },
  '/Game/Maps/Prison/Drones/Stealth/Prison_Drones_Cooling_BP##Cooling_Start': {
    name: '补水设施',
    chapter: 6,
    scene: 4
  },
  '/Game/Maps/Prison/Drones/Stealth/Prison_Drones_Stealth_Outdoor_BP##Stealth_Intro': {
    name: '监狱大院',
    chapter: 6,
    scene: 5
  },
  '/Game/Maps/Prison/Drones/Pinball/Prison_Drones_Pinball_BP##Pinball_Start': {
    name: '弹珠锁',
    chapter: 6,
    scene: 6
  },
  '/Game/Maps/Prison/Arena/Prison_Arena_BP##Intro': {
    name: '处决场',
    chapter: 6,
    scene: 7
  },
  '/Game/Maps/Prison/GarbageRoom/Prison_GarbageRoom_BP##GarbageRoom_Slide': {
    name: '废物处理',
    chapter: 6,
    scene: 8
  },
  '/Game/Maps/Prison/Containment/Prison_TrashCompactor_BP##TrashCompactor_Top': {
    name: '牢房片区',
    chapter: 6,
    scene: 9
  },
  '/Game/Maps/Prison/MaxSecurity/Prison_MaxSecurity_BP##MaxSecurity_Intro': {
    name: '最高安全级别',
    chapter: 6,
    scene: 10
  },
  '/Game/Maps/Prison/Boss/Prison_Boss_BP##Intro': {
    name: '囚犯',
    chapter: 6,
    scene: 11
  },

  // 第七章 虚空
  '/Game/Maps/Sanctuary/Upper/Sanctuary_Upper_Tutorial_BP##Sanctuary Intro': {
    name: '不详的迎接',
    chapter: 7,
    scene: 1
  },
  '/Game/Maps/Sanctuary/Upper/Sanctuary_Upper_BP##Upper WatchTower': {
    name: '记忆碎片',
    chapter: 7,
    scene: 2
  },
  '/Game/Maps/Sanctuary/Below/Sanctuary_DiscSlide_BP##DiscSlide_Start': {
    name: '鬼镇',
    chapter: 7,
    scene: 3
  },
  '/Game/Maps/Sanctuary/Below/Sanctuary_Below_CrackApproach_BP##CrackApproach_DrawBridge': {
    name: '暗夜之光',
    chapter: 7,
    scene: 4
  },
  '/Game/Maps/Sanctuary/Centipede/Sanctuary_Centipede_Tutorial_BP##Centipede_StartRoom': {
    name: '灵魂向导',
    chapter: 7,
    scene: 5
  },
  '/Game/Maps/Sanctuary/Boss/Sanctuary_Boss_Medallion_BP##Hydra Reveal Intro': {
    name: '九头蛇',
    chapter: 7,
    scene: 6
  },

  // 第八章 幻裂奇境
  '/Game/Maps/Meltdown/SplitTraversal/Meltdown_SplitTraversal_BP##Split Traversal Intro': {
    name: '分头行动',
    chapter: 8,
    scene: 1
  },
  '/Game/Maps/Meltdown/SplitTraversal/Meltdown_SplitTraversal_BP##Split Traversal Bridge Entrance': {
    name: '温暖的问候',
    chapter: 8,
    scene: 2
  },
  '/Game/Maps/Meltdown/BossBattle/FirstPhase/Meltdown_BossBattleFirstPhase_BP##Boss phase Start': {
    name: '面对面',
    chapter: 8,
    scene: 3
  },
  '/Game/Maps/Meltdown/SoftSplit/Meltdown_SoftSplit_BP##Soft Split Start': {
    name: '世界分隔',
    chapter: 8,
    scene: 4
  },
  '/Game/Maps/Meltdown/SplitBonanza/Meltdown_SplitBonanza_BP##Split Bonanza Start': {
    name: '横截面',
    chapter: 8,
    scene: 5
  },
  '/Game/Maps/Meltdown/BossBattle/SecondPhase/Meltdown_BossBattleSecondPhase_BP##BossBattlePhase Lava': {
    name: '与神抗争',
    chapter: 8,
    scene: 6
  },
  '/Game/Maps/Meltdown/ScreenWalk/Meltdown_ScreenWalk_BP##Meltdown ScreenWalk Intro': {
    name: '全新视角',
    chapter: 8,
    scene: 7
  },
  '/Game/Maps/Meltdown/WorldSpin/Meltdown_WorldSpin_Fullscreen_BP##WorldSpin Cutscene Intro': {
    name: '打破常规',
    chapter: 8,
    scene: 8
  },
  '/Game/Maps/Meltdown/BossBattle/ThirdPhase/Meltdown_BossBattleThirdPhase_BP##BossBattlePhaseThree First Phase ': {
    name: '终极决战',
    chapter: 8,
    scene: 9
  }
}

const branchMapKeys = Object.keys(map).filter(key => map[key].branch)
