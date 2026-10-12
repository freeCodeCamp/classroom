export type CertificationOption = {
  value: string;
  label?: string;
  displayName: string;
};

export type ClassroomFormFields = {
  classroomName: string;
  description: string | null;
  fccCertifications: string[];
};

export type ClassroomEditValues = ClassroomFormFields & {
  classroomId: string;
};

export type ClassroomSummary = ClassroomEditValues & {
  classroomTeacherId?: string;
  createdAt: string;
};

export type ClassroomResponse = ClassroomEditValues & {
  classroomTeacherId: string;
  createdAt: string;
};

export type CreateClassPayload = ClassroomFormFields & {
  classroomTeacherId: string;
};

export type EditClassPayload = Partial<ClassroomFormFields> & {
  classroomId: string;
};

export type ClassModalPayload = CreateClassPayload | EditClassPayload;
