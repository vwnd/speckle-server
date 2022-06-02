const { Users } = require('@/modules/core/dbSchema')
const { faker } = require('@faker-js/faker')

const RETRY_COUNT = 3

function createFakeUser() {
  return {
    id: faker.unique(faker.random.alphaNumeric, [10]),
    name: faker.name.firstName() + ' ' + faker.name.lastName(),
    bio: faker.lorem.lines(5),
    company: faker.company.companyName(),
    email: faker.unique(faker.internet.email, [
      faker.unique(faker.random.alphaNumeric, [10]),
      faker.unique(faker.random.alphaNumeric, [10])
    ]),
    verified: faker.datatype.boolean(),
    avatar: faker.random.alphaNumeric(255),
    ip: faker.internet.ipv4(),
    passwordDigest: faker.random.alphaNumeric(255)
  }
}

function generateUsers(count) {
  const users = []
  for (let i = 0; i < count; i++) {
    users.push(createFakeUser())
  }
  return users
}

function insertUsers(users) {
  return Users.knex().insert(users)
}

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'users <count> [batchsize]',
  describe: 'Fill the `users` table with a ton of fake users',
  builder(yargs) {
    return yargs
      .positional('count', {
        describe: 'User count',
        type: 'number'
      })
      .positional('batchsize', {
        describe: 'Max amount of inserts to process at once',
        type: 'number',
        default: '500'
      })
  },
  async handler(argv) {
    const count = argv.count
    const batchSize = argv.batchsize

    console.log('Inserting into DB...')

    let userCount = 0
    const promises = []
    const batchCount = Math.ceil(count / batchSize)
    for (let i = 0; i < batchCount; i++) {
      const newUserCount = Math.min(userCount + batchSize, count)
      const insertCount = newUserCount - userCount
      userCount = newUserCount

      const users = generateUsers(insertCount)

      // Build promise with retries
      let p = insertUsers(users).then(() => {
        console.log(`Inserted batch ${i + 1} out of ${batchCount}`)
      })

      for (let k = 0; k < RETRY_COUNT; k++) {
        p = p.catch(() => {
          return insertUsers(generateUsers(insertCount))
        })
      }
      p.catch((e) => {
        console.error('Insertion failed all retries: ', e)
      })

      console.log(`Inserting batch ${i + 1} out of ${batchCount}`)
      await p
    }

    await Promise.all(promises)

    console.log('...done')
  }
}

module.exports = command
