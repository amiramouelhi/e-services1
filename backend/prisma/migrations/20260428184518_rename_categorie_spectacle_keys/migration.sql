-- Rename categorieSpectacle keys to the new naming scheme.
-- Old → new mapping:
--   masrahiyyat       → theatre
--   masrah_ghinnai    → lyrique
--   haflat_musiqi     → Concerts
--   musajjalat        → enregistrements
--   firaq             → orchestres
--   qitaa_ashrita     → piece_mus__films_
--   qitaa_fawasil     → piece_mus_diff
-- (cirque is unchanged)

UPDATE "Spectacle" SET "categorieSpectacle" = 'theatre'           WHERE "categorieSpectacle" = 'masrahiyyat';
UPDATE "Spectacle" SET "categorieSpectacle" = 'lyrique'           WHERE "categorieSpectacle" = 'masrah_ghinnai';
UPDATE "Spectacle" SET "categorieSpectacle" = 'Concerts'          WHERE "categorieSpectacle" = 'haflat_musiqi';
UPDATE "Spectacle" SET "categorieSpectacle" = 'enregistrements'   WHERE "categorieSpectacle" = 'musajjalat';
UPDATE "Spectacle" SET "categorieSpectacle" = 'orchestres'        WHERE "categorieSpectacle" = 'firaq';
UPDATE "Spectacle" SET "categorieSpectacle" = 'piece_mus__films_' WHERE "categorieSpectacle" = 'qitaa_ashrita';
UPDATE "Spectacle" SET "categorieSpectacle" = 'piece_mus_diff'    WHERE "categorieSpectacle" = 'qitaa_fawasil';
