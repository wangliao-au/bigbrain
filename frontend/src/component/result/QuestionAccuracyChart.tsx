import React from 'react';
import LoadingPage from '../../page/LoadingPage';
import ResultLineChart from './ResultLineChart';

interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  title: string;
  media: string;
  type: 'single' | 'multi';
  timeLimit: number;
  point: number;
  answers: Array<{ answer: Answer }>;
}

interface UserAnswer {
  name: string;
  answers: {
    questionStartedAt: string | null;
    answeredAt: string | null;
    answerIds: string[];
    correct: boolean;
  }[];
}

const QuestionAccuracyChart: React.FC<{
    adminResult: UserAnswer[],
    questionList: Array<{ question: Question }>,
}> = ({
  adminResult,
  questionList,
}) => {
  if (adminResult === null) {
    return < LoadingPage />;
  }

  if (adminResult.length === 0) {
    return <h1>No players</h1>;
  }

  const map = new Map();
  questionList.forEach((_question, i) => {
    map.set(`Q${i + 1}`, 0);
  });

  adminResult.forEach(player => {
    player.answers.reduce((acc, ans, i) => {
      if (ans.correct) {
        const question = questionList[i];
        map.set(`Q${i + 1}`, (map.get(question.question.title) || 0) + 1);
      }
      return acc;
    }, 0);
  });

  const totalPlayers = adminResult.length;
  const questionToPercentageMap = Array.from(map).map(([key, value]) => {
    return { question: key, percentage: value / totalPlayers };
  });

  const labels = questionToPercentageMap.map(question => question.question);
  const data = questionToPercentageMap.map(question => question.percentage);

  return (
    <>
        <ResultLineChart labelArray={labels} dataArray={data} labelName="Percentage" title="Question Accuracy" />
    </>
  );
}

export default QuestionAccuracyChart;
