/*
  Здесь лежит функция,
  которая по имени класса и пути до CSS файла
  вернет минифицированное название класса
*/

// Модуль для генерации уникальных названий
// eslint-disable-next-line import/no-extraneous-dependencies
const incstr = require('incstr')

const createUniqueIdGenerator = () => {
  const uniqIds = {}

  const generateNextId = incstr.idGenerator({
    // Буквы d нету, чтобы убрать сочетание ad,
    // так как его может заблокировать Adblock
    alphabet: 'abcefghijklmnopqrstuvwxyzABCEFGHJKLMNOPQRSTUVWXYZ',
  })

  // Для имени возвращаем его минифицированную версию
  return (name) => {
    if (!uniqIds[name]) {
      uniqIds[name] = generateNextId()
    }

    return uniqIds[name]
  }
}

const localNameIdGenerator = createUniqueIdGenerator()
const componentNameIdGenerator = createUniqueIdGenerator()

module.exports = (localName, resourcePath) => {
  const localId = localNameIdGenerator(localName)
  const componentId = componentNameIdGenerator(resourcePath)

  return `${componentId}_${localId}`
}
