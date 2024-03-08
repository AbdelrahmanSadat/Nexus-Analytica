import { Type as t } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";

const getUsers: FastifyPluginAsync = async (
  fastify // since we're using the type provider `FastifyPluginAsync` we don't need to declare argument/return/function types
) => {
  fastify.get<{ Querystring: Partial<User> }>(
    "/",
    {
      schema: {
        querystring: t.Object({
          id: t.Optional(t.Number()),
          name: t.Optional(t.String()),
          age: t.Optional(t.Number()),
          active: t.Optional(t.Boolean()),
          last_login: t.Optional(
            t.Unsafe<Date>({ type: "string", format: "date" })
          ),
        }),
      },
    },
    async (request, reply) => {
      const users = await readUsers();
      console.log("query", request.query);
      const filteredUsers = filterUsers(users, request.query);
      const sortedFilteredUsers = sortUsers(filteredUsers, "last_login");

      return reply.send({ sortedFilteredUsers });
    }
  );
};
// fastify functions do look kinda ugly tho... But ig one can get used to it and abstract a bit out.

export default getUsers;

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
    if (a[sortBy] < b[sortBy])
      return -1;
    if (a[sortBy] > b[sortBy])
      return 1;
    return 0;
  });
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

interface User {
  [key: string]: any;
  id: number | string;
  name: string;
  age: number | string;
  active: boolean;
  last_login: Date;
}
