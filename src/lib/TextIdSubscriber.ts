import { randomUUID } from 'node:crypto';
import { EventSubscriber, type EntitySubscriberInterface, type InsertEvent } from 'typeorm';

@EventSubscriber()
export class TextIdSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<object>): void {
    const primaryColumn = event.metadata.primaryColumns[0];
    const entity = event.entity as { id?: unknown } | undefined;

    if (
      entity &&
      primaryColumn?.propertyName === 'id' &&
      primaryColumn.type === 'text' &&
      !primaryColumn.isGenerated &&
      entity.id == null
    ) {
      entity.id = randomUUID();
    }
  }
}
