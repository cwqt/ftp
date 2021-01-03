function arvelie (date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)
  const doty = Math.floor(diff / 86400000) - 1
  const y = date.getFullYear().toString().substr(2, 2)
  const m = doty === 364 || doty === 365 ? '+' : String.fromCharCode(97 + Math.floor(doty / 14)).toUpperCase()
  const d = `${(doty === 365 ? 1 : doty === 366 ? 2 : (doty % 14)) + 1}`.padStart(2, '0')
  return `${y}${m}${d}`
}

function neralie (d = new Date(), e = new Date(d)) {
  const ms = e - d.setHours(0, 0, 0, 0)
  const val = (ms / 8640 / 10000).toFixed(6)
  return `${val.substr(2, 3)}:${val.substr(5, 3)}`
}


module.exports = {date:arvelie, time:neralie}