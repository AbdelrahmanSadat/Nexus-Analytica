import { Static, Type as t } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";
import lunr from "lunr";

const getUsers: FastifyPluginAsync = async (
  fastify // since we're using the type provider `FastifyPluginAsync` we don't need to declare argument/return/function types
) => {
  fastify.get<{ Querystring: UserQuery }>(
    "/",
    {
      schema: {
        // our api schema
        querystring: userQuery,
      },
    },
    async (request, reply) => {
      const users = await readUsers();
      const { search_name: searchName, ...params } = request.query;
      const filteredUsers = filterUsers(users, params);
      let sortedFilteredUsers = sortUsers(filteredUsers, "last_login");
      if (searchName)
        sortedFilteredUsers = searchByName(sortedFilteredUsers, searchName);
      const userStats = userStatAggregator(sortedFilteredUsers);
      return reply.send({ users: sortedFilteredUsers, stats: userStats });
    }
  );
};

export default getUsers;

// I opted to keep utility funcs and type definitions in the same file for simplicity's sake
// =================================================================================================
// Utility functions
// =================================================================================================

const filterUsers: (users: User[], params: Partial<User>) => User[] = (
  users,
  params
) => {
  return users.filter((user) => {
    return Object.keys(params).every((key) => {
      return user[key] === params[key];
    });
  });
};

const sortUsers: (users: User[], sortBy: keyof User) => User[] = (
  users,
  sortBy
) => {
  return users.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });
};

const userStatAggregator = (users: User[]) => {
  const reducer = (
    acc: { activeUsers: number; avgAge: number },
    curr: User
  ) => {
    acc.activeUsers += curr.active ? 1 : 0;
    acc.avgAge = (acc.avgAge * (users.length - 1) + +curr.age) / users.length;
    return acc;
  };
  const aggregate = users.reduce(reducer, { activeUsers: 0, avgAge: 0 });
  return aggregate;
};

const readUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../../../assets/users.json");
    fs.readFile(filePath, "utf8", (err: Error, data: string) => {
      //json being technically a string
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};

// ! This is not suitable for production. `lunr` is a good use for static docs
// ! I use it here since users are in a static file
const searchByName = (users: User[], searchWord: string) => {
  // ? idx for static files could be cached
  var idx = lunr(function () {
    this.ref("id");
    this.field("name");
    users.forEach(function (user) {
      // @ts-ignore
      this.add(user);
    }, this);
  });

  // fuzzy matching degree can be customized
  const searchResultIds = idx
    .search(`${searchWord}~2`)
    .map((item) => +item.ref);

  return users.filter((user) => searchResultIds.includes(+user.id));
};

// =================================================================================================
// Types & Validation Schemas
// =================================================================================================

interface User {
  [key: string]: any;
  id: number | string;
  name: string;
  age: number | string;
  active: boolean;
  last_login: Date;
}

const userQuery = t.Object({
  id: t.Optional(t.Number()),
  name: t.Optional(t.String()),
  age: t.Optional(t.Number()),
  active: t.Optional(t.Boolean()),
  last_login: t.Optional(t.Unsafe<Date>({ type: "string", format: "date" })),
  search_name: t.Optional(t.String()),
});

type UserQuery = Static<typeof userQuery>;
