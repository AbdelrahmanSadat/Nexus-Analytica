import { FastifyInstance, FastifyPluginAsync } from "fastify";

const getUsers: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const users = await readUsers();
    return reply.send({ users });
  });
};

export default getUsers;





const readUsers = (): Promise<user[]> => {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../../../assets/users.json");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
};

interface user {
  id: number;
  name: string;
  age: number;
  active: boolean;
  last_login: Date;
}
