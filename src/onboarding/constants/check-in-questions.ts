import { StageEnum } from '../enums/stage.enum';
import { CheckInCategoryEnum } from '../enums/check-in-category.enum';

export interface CheckInQuestion {
  id: string;
  stageText: string;
  category: CheckInCategoryEnum;
  questionText: string;
  order: number;
}

export const CHECK_IN_QUESTIONS: Record<StageEnum, Record<CheckInCategoryEnum, CheckInQuestion[]>> = {
  [StageEnum.PRE_LICENSE]: {
    [CheckInCategoryEnum.WORK]: [
      {
        id: 'pre_work_1',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Cómo se siente esta semana tu experiencia laboral en términos de claridad, carga y acompañamiento?',
        order: 1,
      },
      {
        id: 'pre_work_2',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Qué tan claro se siente el proceso previo a la licencia?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.WELLBEING]: [
      {
        id: 'pre_wellbeing_1',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Cómo se siente hoy tu bienestar emocional y físico?',
        order: 1,
      },
      {
        id: 'pre_wellbeing_2',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Cómo está tu nivel de energía esta semana?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.HOME]: [
      {
        id: 'pre_home_1',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Cómo se siente esta semana la organización del hogar y los cuidados?',
        order: 1,
      },
      {
        id: 'pre_home_2',
        stageText: 'pre-licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Qué tan manejable se siente la carga mental esta semana?',
        order: 2,
      },
    ],
  },
  [StageEnum.LICENSE]: {
    [CheckInCategoryEnum.WORK]: [
      {
        id: 'lic_work_1',
        stageText: 'licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Qué tan respetada se siente hoy tu licencia por la organización?',
        order: 1,
      },
      {
        id: 'lic_work_2',
        stageText: 'licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Qué tan claro se siente hoy el regreso?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.WELLBEING]: [
      {
        id: 'lic_wellbeing_1',
        stageText: 'licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Cómo se siente hoy tu bienestar emocional y físico?',
        order: 1,
      },
      {
        id: 'lic_wellbeing_2',
        stageText: 'licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Qué tan posible es hoy descansar o recuperar energía?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.HOME]: [
      {
        id: 'lic_home_1',
        stageText: 'licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Cómo se siente hoy la organización diaria del hogar y los cuidados?',
        order: 1,
      },
      {
        id: 'lic_home_2',
        stageText: 'licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Qué tan posible es hoy pedir ayuda o delegar?',
        order: 2,
      },
    ],
  },
  [StageEnum.POST_LICENSE]: {
    [CheckInCategoryEnum.WORK]: [
      {
        id: 'post_work_1',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Cómo se siente hoy el regreso al trabajo?',
        order: 1,
      },
      {
        id: 'post_work_2',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.WORK,
        questionText: '¿Qué tan flexible se siente hoy tu trabajo para esta etapa?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.WELLBEING]: [
      {
        id: 'post_wellbeing_1',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Cómo se siente hoy tu bienestar emocional y físico?',
        order: 1,
      },
      {
        id: 'post_wellbeing_2',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.WELLBEING,
        questionText: '¿Cómo está tu nivel de energía esta semana?',
        order: 2,
      },
    ],
    [CheckInCategoryEnum.HOME]: [
      {
        id: 'post_home_1',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Cómo se siente hoy la organización del hogar y los cuidados?',
        order: 1,
      },
      {
        id: 'post_home_2',
        stageText: 'post-licencia',
        category: CheckInCategoryEnum.HOME,
        questionText: '¿Qué tan manejable se siente la carga mental diaria?',
        order: 2,
      },
    ],
  },
};
