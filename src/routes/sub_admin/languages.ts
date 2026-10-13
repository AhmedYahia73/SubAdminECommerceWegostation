import { Router } from "express";
import {
  getAllLanguages,
  getLanguagesSelection,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "../../controllers/sub_admin/languages";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createLanguageSchema,
  updateLanguageSchema,
  languageIdParamSchema,
} from "../../validators/sub_admin/languages";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllLanguages));
router.get("/select", checkOnlyAdmin(), catchAsync(getLanguagesSelection));
router.get("/:id", checkOnlyAdmin(), validate(languageIdParamSchema), catchAsync(getLanguageById));
router.post("/", checkOnlyAdmin(), validate(createLanguageSchema), catchAsync(createLanguage));
router.put("/:id", checkOnlyAdmin(), validate(updateLanguageSchema), catchAsync(updateLanguage));
router.delete("/:id", checkOnlyAdmin(), validate(languageIdParamSchema), catchAsync(deleteLanguage));

export default router;
