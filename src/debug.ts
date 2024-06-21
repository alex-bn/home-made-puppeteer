import puppeteer, { Browser, ConsoleMessage } from "puppeteer";
import UtilityClass from "./utils/UtilityClass";
import settings from "./tests/_settings.json";
import assert from "node:assert";
import automationExerciseApi from "./test-clients/automation-exercise/AutomationExerciseApi";
import { Product, ApiError } from "./test-clients/automation-exercise/interfaces";
import Helpers from "./test-clients/automation-exercise/Helpers";

//

const pageHelper = new UtilityClass();
async function main() {
  try {
  } catch (error) {
    console.log(error);
  }
}
main();
