import { DatabaseError, NotFoundError, ForbiddenError } from "../errors";

export class LearningItemsDatabaseError extends DatabaseError {}

export class LearningItemNotFoundError extends NotFoundError {}

export class LearningItemForbiddenError extends ForbiddenError {}
