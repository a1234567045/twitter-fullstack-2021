const db = require('../models')
const Followship = db.Followship
const User = db.User
const helpers = require('../_helpers')

const userController = {
  getUserTweets: (req, res) => {

  },
  getSetting: (req, res) => {

  },
  editSetting: (req, res) => {

  },
  getReplies: (req, res) => {

  },
  getLikes: (req, res) => {

  },
  getFollowings: async (req, res) => {
    try {
      const userself = req.user.id
      const users = await User.findAll({// 撈出所有 User 與 followers 資料
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ]
      })
      let user = []

      user = users.map(user => ({ // 整理 users 資料
        ...user.dataValues,
        FollowerCount: user.Followers.length,// 計算追蹤者人數
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id),// 判斷目前登入使用者是否已追蹤該 User 物件
      }))

      helpers.removeUser(user, userself)//移除使用者自身資訊
      user = user.sort((a, b) => b.FollowerCount - a.FollowerCount)// 依追蹤者人數排序清單

      return res.render('following', { user })
    }
    catch (err) {
      console.log(err)
      console.log('getUserFollowers err')
      return res.redirect('back')
    }
  },

  getFollowers: async (req, res) => {
    try {
      const userself = req.user.id
      const users = await User.findAll({// 撈出所有 User 與 followers 資料
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })

      let user = []

      user = users.map(user => ({ // 整理 users 資料
        ...user.dataValues,
        FollowerCount: user.Followers.length,// 計算追蹤者人數
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id),// 判斷目前登入使用者是否已追蹤該 User 物件
      }))
      helpers.removeUser(user, userself)//移除使用者自身資訊
      user = user.sort((a, b) => b.FollowerCount - a.FollowerCount)// 依追蹤者人數排序清單

      const followers = await Followship.findAll({//依追蹤時間排序追蹤者
        raw: true,
        nest: true,
        where: {
          followingId: req.user.id
        },
        order: [
          ['createdAt', 'DESC']
        ]
      })

      let Data = []

      Data = followers.map(async (item, index) => {// 整理 followers 資料
        let user = await User.findByPk(item.followerId)
        user = user.dataValues
        isFollowed = req.user.Followings.map(d => d.id).includes(user.id)// 判斷目前登入使用者是否已追蹤該 User 物件
        return {
          ...item.user,
          user,
          isFollowed
        }
      })

      Promise.all(Data).then(data => {
        return res.render('follower', { user, data })
      })

    }
    catch (err) {
      console.log(err)
      console.log('getUserFollowers err')
      return res.redirect('back')
    }
  }
}



module.exports = userController