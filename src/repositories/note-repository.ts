import { prisma } from "@/lib/prisma";

export async function createNote(travelDayId: string, content: string) {
  return prisma.note.create({
    data: { travelDayId, content },
  });
}

export async function deleteNote(noteId: string, travelDayId: string) {
  return prisma.note.deleteMany({
    where: { id: noteId, travelDayId },
  });
}

export async function updateNote(
  noteId: string,
  travelDayId: string,
  content: string,
) {
  return prisma.note.updateMany({
    where: { id: noteId, travelDayId },
    data: { content },
  });
}

export async function findNoteById(noteId: string) {
  return prisma.note.findUnique({
    where: { id: noteId },
    include: { travelDay: { select: { tripId: true } } },
  });
}
