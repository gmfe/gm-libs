;(function () {
  var script = document.scripts[document.scripts.length - 1]
  var platform = script && script.dataset.platform

  if (!platform) {
    console.warn('can not find platform in <script data-platform=')
    return
  }

  function getMetaData() {
    const enterTime = new Date() + ''
    return {
      branch: window.____fe_branch,
      commit: window.____git_commit,
      group_id:
        window.g_group_id ||
        window.g_partner_id ||
        (window.g_user && window.g_user.group_id),
      station_id: window.g_user && window.g_user.station_id,
      cms_key: window.g_cms_config && window.g_cms_config.key,
      name:
        (window.g_user &&
          (window.g_user.name ||
            window.g_user.username ||
            window.g_user.user_name)) ||
        null,
      enterTime,
      // 能取到就取到
      clientId: localStorage.getItem('_gm-common__CLIENT_ID'),
      origin: window.location.href,
      userAgent: window.navigator.userAgent,
      cookie: window.document.cookie,
    }
  }

  // 注意，要 es5
  function doFetch(url, data) {
    try {
      var xhr = new XMLHttpRequest()
      xhr.open(
        'post',
        url.indexOf('?') === -1
          ? url + '?v=' + Math.random()
          : url + '&v=' + Math.random(),
      )
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send(JSON.stringify(data))
    } catch (err) {
      // 可能 JSON.stringify 有问题
      console.warn(err)
    }
  }

  // 统计到 more
  function reportTrace(data) {
    // 附加额外信息
    data._platform = platform
    data.metaData = getMetaData()

    doFetch('https://trace.guanmai.cn/api/logs/more/' + platform, data)
  }

  window.addEventListener(
    'error',
    function (e) {
      var target = e.target || {}
      if (target.nodeName === 'SCRIPT') {
        console.error('script error', target.src)
        reportTrace({
          msg: 'script error',
          src: target.src,
        })
      }
    },
    true,
  )
})()
