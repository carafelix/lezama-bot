import { Menu } from "@grammyjs/menu";
import { Lezama } from "./bot";
import { shuffleArray } from "../utils/utils";
import { allIDs, shortiesIDs } from "../data/poemsIDs";
import { updateUserSubscribeHour } from "../lib/database/kv";

const landingText = `<b>Lezama - Poesía a domicilio</b>

Este bot te permite:
- Recibir un poema al día (distinto para cada persona).
- Configurar la hora a la cual te gustaría recibir el famoso poema.
- Seleccionar la fuente de autores o libros desde los cuales se elige el poema.

Puedes listar los comandos disponibles y todo lo necesario para el uso de este bot con /help.
Si deseas contribuir o conocer la arquitectura del bot, todo aquello lo encontrarás en /info.
Una vez suscrito puedes usar /settings.

Pulsa el botón de abajo y comenzaras a recibir un poema al día`;

const landingMenu = new Menu<Lezama>("landing")
  .text(async (c) => {
    const session = await c.session;
    return session.subscribed ? "Pausar" : "Suscríbete!";
  }, async (c, next) => {
    const session = await c.session;
    let allSubscribersAtThisHour = await c.kv.read(`cron-${session.cron.hour}`);

    if (!session.subscribed) {
      allSubscribersAtThisHour[`${session.chatID}`] = true;
      await c.kv.write(`cron-${session.cron.hour}`, allSubscribersAtThisHour);
      session.subscribed = true;

      const displayHour = session.cron.hour + session.cron.timezoneOffset;
      await c.reply(
        `Welcome to the Paradiso. Tus poemas quedaron programados para las ${
          displayHour <= 0 ? displayHour + 24 : displayHour
        }:00, UTC${
          session.cron.timezoneOffset >= 0
            ? "+" + session.cron.timezoneOffset
            : "" + session.cron.timezoneOffset
        }, puedes cambiarlo en /settings`,
      );
    } else {
      delete allSubscribersAtThisHour[`${session.chatID}`];
      await c.kv.write(`cron-${session.cron.hour}`, allSubscribersAtThisHour);
      session.subscribed = false;
      await c.reply("Hasta la vista!");
    }
    c.menu.update();
  });

export const landing = {
  menu: landingMenu,
  text: landingText,
};

export const helpText =
  `/start - Inicia el bot. Si algo no funciona bien, vuelve a tirar este comando.
/settings - Accede al menu de configuraciones, toggle poemas largos, libros, autores, ordenar tu cola, etc.
/help - Lista los comandos disponibles.
/info - Información relativa al bot mismo.
/queueinfo - Muestra información de tu cola de poemas.
/resetqueue - Reinicia tu cola de poemas personal y la revuelve.
/randompoem - Recibe un poema al azar de la colección.`;

const settingsText = `<b>Configuraciones</b>

Aquí podrás configurar:

- La hora a la que deseas recibir el poema diario, o ponerla en aleatorio.

- Configurar tu cola de poemas personal:
    - Seleccionar los libros u autores de los cuales se conformara tu cola.
    - Ordenarla por fecha de publicación, por orden alfabético o en aleatorio.
`;
const settingsMenu = new Menu<Lezama>("settings-menu")
  .submenu(
    "Seleccionar hora",
    "select-suscribe-hour-menu",
    async (c) => await c.editMessageText(await getSelectSubscribeHourText(c)),
  )
  .submenu(
    "Configurar cola",
    "config-queue",
    async (c) =>
      c.editMessageText(await getConfigQueueText(c), { parse_mode: "HTML" }),
  );

const getSelectSubscribeHourText = async (c: Lezama) => {
  const session = await c.session;
  const displayHour = session.cron.hour + session.cron.timezoneOffset;
  return `Selecciona la hora a la que quieres recibir el diario placer. Actual: ${
    displayHour <= 0 ? displayHour + 24 : displayHour
  }:00, UTC${
    session.cron.timezoneOffset >= 0
      ? "+" + session.cron.timezoneOffset
      : "" + session.cron.timezoneOffset
  }.`;
};
const selectSubscribeHour = new Menu<Lezama>("select-suscribe-hour-menu")
  .dynamic((ctx, range) => {
    for (let i = 1; i <= 24; i++) {
      range
        .text(`${i < 10 ? "0" : ""}${i}:00`, async (c) => {
          const session = await c.session;

          const oldCronHour = session.cron.hour;
          const newHour = (i - session.cron.timezoneOffset + 24) % 24;
          session.cron.hour = newHour;

          await updateUserSubscribeHour(
            c,
            `${session.chatID}`,
            oldCronHour,
            session.cron.hour,
          );

          await c.editMessageText(await getSelectSubscribeHourText(c));
        });

      if (i % 4 == 0) {
        range.row();
      }
    }
  })
  .row()
  // this should be 'Cambiar Huso horario' with a reply msg with your current time
  .text(
    (c) => `Cambiar huso horario`,
    (c) =>
      c.reply(
        "Contesta este mensaje con tu huso horario en formato UTC+h, en numero enteros. \nEjemplos: UTC+4, UTC-5, UTC+9, UTC+10.",
        { reply_markup: { force_reply: true } },
      ),
  )
  .row()
  .url(
    "Tu huso horario",
    "https://www.timeanddate.com/time/difference/timezone/utc",
  )
  .back(
    "Volver",
    (c) => c.editMessageText(settingsText, { parse_mode: "HTML" }),
  );

const getConfigQueueText = async (c: Lezama) => {
  return (
    `<b>Configura tu cola de poemas</b>

Por defecto incluye solo los poemas de menos de mil caracteres. Activando la opción de poemas largos incluye hasta el tope de 4096 caracteres.

Info de tu cola:
${await getQueueInfoText(c)}
`
  );
};

export const getQueueInfoText = async (c: Lezama) => {
  const session = await c.session;
  return (
    `Poemas por visitar: ${session.poems.queue.length}.
Poemas visitados: ${session.poems.visited.length}.
`
  );
};

const configQueueMenu = new Menu<Lezama>("config-queue")
  .text(async (c) => {
    const session = await c.session;
    return !session.poems.includeMiddies
      ? "Activar poemas largos"
      : "Desactivar poemas largos";
  }, async (c) => {
    const session = await c.session;
    if (!session.poems.visited) session.poems.visited = [];

    session.poems.includeMiddies = !session.poems.includeMiddies;
    if (session.poems.includeMiddies) {
      session.poems.all = allIDs;
      session.poems.queue = shuffleArray(
        allIDs.filter((id) => !session.poems.visited.includes(id)),
      );
    } else {
      session.poems.all = shortiesIDs;
      session.poems.queue = shuffleArray(
        shortiesIDs.filter((id) => !session.poems.visited.includes(id)),
      );
    }
    c.menu.update();
    c.editMessageText(await getConfigQueueText(c), { parse_mode: "HTML" });
  })
  .submenu(
    "Resetear cola",
    "reset-queue-confirm",
    async (c) => c.editMessageText(await getResetQueueConfirmText(c)),
  )
  .row()
  .back(
    "Volver",
    async (c) => await c.editMessageText(settingsText, { parse_mode: "HTML" }),
  );

export const settings = {
  menu: settingsMenu,
  text: settingsText,
};

const infoText = `<b>Información</b>

Este bot esta construido sobre los Webhooks de Telegram en conjunto con Cloudflare Workers, un proveedor de funciones anónimas encima del Edge runtime.

El telegram bot framework es Grammy, el cual cuenta con muy buena documentación y un gran abanico de herramientas, incluido hosting gratis para la data de sesión.

Para el hosting de los poemas usa MongoDB Atlas. Para el hosting de la data de sesión usa una database SQL, D1, de Cloudflare, en conjunto con KV, un sistema de almacenamiento rápido, también de Cloudflare, para chequear los usuarios con suscripción activa.

Puedes encontrar el código fuente en Github, y si deseas contribuir o comunicarme alguna idea, me puedes contactar al telegram en 'Contacto' o abrir un Issue en Github.
`;
const infoMenu = new Menu<Lezama>("info-menu")
  .url("Contacto", "https://t.me/BotGodMaster")
  .url("Github", "https://github.com/carafelix/lezama-api").row();

export const info = {
  menu: infoMenu,
  text: infoText,
};

const getResetQueueConfirmText = async (c: Lezama) => {
  const session = await c.session;
  return (
    `Realmente quiere reiniciar tu cola?
Aún te quedan ${session.poems.queue.length} poemas por visitar.`
  );
};

const resetQueueConfirmMenu = new Menu<Lezama>("reset-queue-confirm")
  .text("Si", async (c) => {
    const session = await c.session;
    session.poems.queue = shuffleArray(session.poems.all.slice());
    await c.reply("Cola reseteada");
  })
  .text("Mejor no", async (c) => {
    c.menu.close();
    await c.editMessageText("Sabia decisión.");
  });

export const resetQueue = {
  menu: resetQueueConfirmMenu,
  text: getResetQueueConfirmText,
};

settingsMenu.register(selectSubscribeHour);
settingsMenu.register(configQueueMenu);
configQueueMenu.register(resetQueueConfirmMenu);

export const menus = [settings, info, landing, resetQueue];
