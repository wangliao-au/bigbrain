import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Navbar from '../../component/dashboard/Navbar';
import apiRequest, { ApiResponse } from '../../util/api';
import LoadingPage from '../LoadingPage';
import NotFoundPage from '../NotFoundPage';
import { uid } from 'uid';
import EditQuestionPage from './EditQuestionPage';

interface Question {
  id: string;
  title: string;
  media: string;
  type: 'single' | 'multiple';
  timeLimit: number;
  points: number;
  answers: Array<{ answer: string }>;
}

interface GameApiResponse extends ApiResponse {
  name: string;
  thumbnail: string | null;
  owner: string;
  active: boolean | null;
  questions: Array<{ question: Question }>; // Define the question structure as needed
}

const EditGamePage: React.FC = () => {
  const { gameId, questionId } = useParams();
  // if questionId is defined, return GameQuestionEditPage
  if (questionId) {
    return <EditQuestionPage qId={questionId} gameId={gameId} />;
  }

  const navigate = useNavigate();

  const [resp, setResp] = useState<GameApiResponse | null>(null);
  const [gameThumbnail, setGameThumbnail] = useState<string | null>(null);
  const [gameName, setGameName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiRequest('GET', `/admin/quiz/${gameId}`);
      setResp(response as GameApiResponse);
      setGameThumbnail(response.thumbnail === null ? null : String(response.thumbnail));
      setGameName(String(response.name));
    };
    fetchData();
  }, [gameId]);

  if (!resp) {
    return <LoadingPage />;
  }

  if (resp.error) {
    return (
      <>
        <NotFoundPage />
      </>
    );
  }

  const deleteQuestion = (qid: string) => {
    const newQuestions = resp.questions.filter((obj) => obj.question.id !== qid);
    resp.questions = newQuestions;
    setResp({ ...resp });
    apiRequest('PUT', `/admin/quiz/${gameId}`, resp);
  };

  const addQuestion = () => {
    const qId = `question-${uid()}`;
    resp.questions.push({
      question: {
        id: qId,
        title: 'Default Question Title',
        media: 'https://cdn.dribbble.com/userupload/4487190/file/original-d4c3ba33335a133315f0e2dca0332649.png?compress=1&resize=752x',
        type: 'single',
        timeLimit: 5,
        points: 100,
        answers: [],
      },
    });
    setResp({ ...resp });
    apiRequest('PUT', `/admin/quiz/${gameId}`, resp);
  };

  const editQuestion = (qid: string) => {
    navigate(`/game/edit/${gameId}/${qid}`);
  };

  return (
    <>
      <Navbar />
      <div className="bg-sky-100 flex flex-col content-center justify-center py-20">
        <h1 className="text-2xl mb-8">Edit Game: {gameName}</h1>
        <div className="mb-4">
          <label htmlFor="gameName" className="block text-s font-medium text-gray-700">Game Name</label>
          <input
            type="text"
            name="gameName"
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-s"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="gameThumbnail" className="block text-s font-medium text-gray-700">Game Thumbnail</label>
          <input
            type="text"
            name="gameThumbnail"
            id="gameThumbnail"
            value={gameThumbnail || ''}
            onChange={(e) => setGameThumbnail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mt-3 flex justify-center">
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => { /* TODO: Save changes */ }}>Save Changes</button>
        </div>
          <h2 className="text-xl mt-8 mb-4">Questions</h2>
          <ul>
          {resp.questions.map((obj, index) => {
            if (!obj || !obj.question) {
              return null;
            }
            return (
              <li key={index} className="mb-2">
                <div className="flex items-center">
                  <button className="bg-red-500 text-white px-2 py-1 rounded mr-2" onClick={() => deleteQuestion(obj.question.id)}>Delete</button>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2" onClick={() => editQuestion(obj.question.id)}>Edit</button>
                  <span className="text-lg text-black">{obj.question.title}</span>
                </div>
              </li>
            );
          })}
          </ul>
          <div className="mt-2">
            <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2" onClick={() => addQuestion()}>Add Question</button>
          </div>
      </div>
    </>
  );
};

export default EditGamePage;
