import { Type as t } from "@fastify/type-provider-typebox";
import { FastifyInstance, FastifyPluginAsync } from "fastify";

const getUsers: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
  fastify.get<{ Querystring: Partial<User> }>(
    "/",
    {
      schema: { querystring: t.Object({
        id: t.Optional(t.Number()),
        name: t.Optional(t.String()),
        age: t.Optional(t.Number()),
        active: t.Optional(t.Boolean()),
        last_login: t.Optional(t.Unsafe<Date>({ type: 'string', format: 'date' })),
      }) },
    },
    async (request, reply) => {
      const users = await readUsers();
      console.log("query", request.query);
      const filteredUsers = filterUsers(users, request.query);
      return reply.send({ filteredUsers });
    }
  );
};

export default getUsers;

const filterUsers: (users: User[], params: Partial<User>) => User[] = (
  users,
  params
) => {
  return users.filter((user) => {
    return Object.keys(params).every((key) => {
      // todo? double equals for coalescing? or does the query do that?
      return user[key] === params[key];
    });
  });
};

const readUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../../../assets/users.json");
    fs.readFile(filePath, "utf8", (err: Error, data: string) => { //json being technically a string
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
