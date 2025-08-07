import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  FileText,
} from "lucide-react";
import "./App.css";

const topics = [
  { id: "security-controls", title: "Security Controls" },
  { id: "encryption", title: "Encryption" },
  { id: "hashing", title: "Hashing" },
  { id: "digital-signatures", title: "Digital Signatures" },
  { id: "digital-certificates", title: "Digital Certificates" },
  { id: "threat-actor-types", title: "Threat Actor Types" },
  {
    id: "threat-vectors-attack-surfaces",
    title: "Threat Vectors & Attack Surfaces",
  },
  { id: "social-engineering", title: "Social Engineering" },
  { id: "security-vulnerabilities", title: "Security Vulnerabilities" },
  { id: "malware-attacks", title: "Malware Attacks" },
  { id: "network-attacks", title: "Network Attacks" },
  { id: "application-attacks", title: "Application Attacks" },
  {
    id: "indicators-malicious-activity",
    title: "Indicators of Malicious Activity",
  },
  { id: "data-protection-concepts", title: "Data Protection Concepts" },
  { id: "resilience-recovery", title: "Resilience & Recovery" },
  { id: "wireless-security-settings", title: "Wireless Security Settings" },
  { id: "application-security", title: "Application Security" },
  { id: "vulnerability-management", title: "Vulnerability Management" },
  { id: "secure-network-protocols", title: "Secure Network Protocols" },
  { id: "access-controls", title: "Access Controls" },
  { id: "password-concepts", title: "Password Concepts" },
  { id: "incident-response-activities", title: "Incident Response Activities" },
  { id: "risk-management-concepts", title: "Risk Management Concepts" },
  { id: "agreement-types", title: "Agreement Types" },
  { id: "penetration-testing", title: "Penetration Testing" },
];

const practiceTests = [{ id: "practice-test2", title: "Practice Test 2" }];

// Function to load topic data from JSON files
const loadTopicData = async (topicId) => {
  try {
    // In a real application, this would load from public/data/[topicId].json
    const response = await fetch(`/data/${topicId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading ${topicId}:`, error);
    return null;
  }
};

// Function to get available topics (checks if JSON file exists)
const checkTopicAvailability = async (topicId) => {
  try {
    const response = await fetch(`/data/${topicId}.json`, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default function SecurityQuizApp() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(new Set());
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizEndTime, setQuizEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState(new Set());
  const [availablePracticeTests, setAvailablePracticeTests] = useState(
    new Set()
  );

  // Check which topics and practice tests have JSON files available
  useEffect(() => {
    const checkAvailability = async () => {
      const availableTopicsSet = new Set();
      const availablePracticeTestsSet = new Set();

      // Check topics
      for (const topic of topics) {
        const isAvailable = await checkTopicAvailability(topic.id);
        if (isAvailable) {
          availableTopicsSet.add(topic.id);
        }
      }

      // Check practice tests
      for (const test of practiceTests) {
        const isAvailable = await checkTopicAvailability(test.id);
        if (isAvailable) {
          availablePracticeTestsSet.add(test.id);
        }
      }

      setAvailableTopics(availableTopicsSet);
      setAvailablePracticeTests(availablePracticeTestsSet);
    };

    checkAvailability();
  }, []);

  const startQuiz = async (topicId) => {
    const isTopic = topics.some((t) => t.id === topicId);
    const isPracticeTest = practiceTests.some((t) => t.id === topicId);

    if (isTopic && !availableTopics.has(topicId)) {
      alert(
        `Questions for this topic are not available yet. Please add the ${topicId}.json file to the /public/data/ folder.`
      );
      return;
    }

    if (isPracticeTest && !availablePracticeTests.has(topicId)) {
      alert(
        `Practice test is not available yet. Please add the ${topicId}.json file to the /public/data/ folder.`
      );
      return;
    }

    setLoading(true);
    try {
      const topicData = await loadTopicData(topicId);
      if (topicData && topicData.questions && topicData.questions.length > 0) {
        setSelectedTopic(topicData);
        setCurrentView("quiz");
        setCurrentQuestion(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
        setSelectedAnswers(new Set());
        setShowResults(false);
        setQuizStartTime(new Date());
      } else {
        alert("No questions found in this file.");
      }
    } catch (error) {
      alert(
        "Error loading quiz data. Please check if the JSON file exists and is properly formatted."
      );
      console.error("Quiz loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const currentQuestionData = selectedTopic.questions[currentQuestion];
    const isMultipleChoice = Array.isArray(currentQuestionData.correct);

    if (isMultipleChoice) {
      // Handle multiple choice question
      const newSelectedAnswers = new Set(selectedAnswers);
      if (newSelectedAnswers.has(answerIndex)) {
        newSelectedAnswers.delete(answerIndex);
      } else {
        newSelectedAnswers.add(answerIndex);
      }
      setSelectedAnswers(newSelectedAnswers);
    } else {
      // Handle single choice question
      setSelectedAnswer(answerIndex);
    }
  };

  const nextQuestion = () => {
    const currentQuestionData = selectedTopic.questions[currentQuestion];
    const isMultipleChoice = Array.isArray(currentQuestionData.correct);

    const newAnswers = [...userAnswers];
    if (isMultipleChoice) {
      newAnswers[currentQuestion] = Array.from(selectedAnswers);
    } else {
      newAnswers[currentQuestion] = selectedAnswer;
    }
    setUserAnswers(newAnswers);
    setSelectedAnswer(null);
    setSelectedAnswers(new Set());

    const questions = selectedTopic.questions;
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizEndTime(new Date());
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setSelectedAnswers(new Set());
    setShowResults(false);
    setQuizStartTime(new Date());
  };

  const goHome = () => {
    setCurrentView("home");
    setSelectedTopic(null);
  };

  const navigateToTopics = () => {
    setCurrentView("topics");
  };

  const navigateToPracticeTests = () => {
    setCurrentView("practice-tests");
  };

  const calculateScore = () => {
    const questions = selectedTopic.questions;
    const correctAnswers = userAnswers.reduce((count, answer, index) => {
      const question = questions[index];
      const isMultipleChoice = Array.isArray(question.correct);

      console.log(`Question ${index + 1}:`, {
        userAnswer: answer,
        correctAnswer: question.correct,
        isMultipleChoice,
        question: question.question,
      });

      if (isMultipleChoice) {
        // For multiple choice questions, check if all correct answers are selected and no incorrect ones
        const userSelected = new Set(answer || []);
        const correctSet = new Set(question.correct);

        console.log("Multiple choice:", {
          userSelected: Array.from(userSelected),
          correctSet: Array.from(correctSet),
          userSize: userSelected.size,
          correctSize: correctSet.size,
        });

        // Check if user selected exactly the correct answers
        if (userSelected.size === correctSet.size) {
          for (const correctIndex of correctSet) {
            if (!userSelected.has(correctIndex)) {
              console.log("Missing correct answer:", correctIndex);
              return count; // Missing a correct answer
            }
          }
          console.log("All correct answers selected");
          return count + 1; // All correct answers selected
        }
        console.log("Wrong number of answers or incorrect selection");
        return count; // Wrong number of answers or incorrect selection
      } else {
        // For single choice questions
        const isCorrect = answer === question.correct;
        console.log("Single choice:", {
          answer,
          correct: question.correct,
          isCorrect,
        });
        return isCorrect ? count + 1 : count;
      }
    }, 0);
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const getTimeTaken = () => {
    if (quizStartTime && quizEndTime) {
      const timeDiff = Math.round((quizEndTime - quizStartTime) / 1000);
      const minutes = Math.floor(timeDiff / 60);
      const seconds = timeDiff % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return "0:00";
  };

  const isAnswerSelected = (answerIndex) => {
    const currentQuestionData = selectedTopic.questions[currentQuestion];
    const isMultipleChoice = Array.isArray(currentQuestionData.correct);

    if (isMultipleChoice) {
      return selectedAnswers.has(answerIndex);
    } else {
      return selectedAnswer === answerIndex;
    }
  };

  const canProceed = () => {
    const currentQuestionData = selectedTopic.questions[currentQuestion];
    const isMultipleChoice = Array.isArray(currentQuestionData.correct);

    if (isMultipleChoice) {
      return selectedAnswers.size > 0;
    } else {
      return selectedAnswer !== null;
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (currentView === "home") {
    return (
      <div className="app">
        <div className="container">
          <div className="header">
            <h1 className="main-title">CompTIA Security+ SY0-701</h1>
            <p className="subtitle">Practice Quiz Application</p>
            <div className="stats-badge">
              <Award className="icon" />
              <span>
                {availableTopics.size + availablePracticeTests.size} Items
                Available
              </span>
            </div>
          </div>

          <div className="menu-grid">
            <div onClick={navigateToTopics} className="menu-card topics-card">
              <div className="menu-content">
                <BookOpen className="menu-icon" />
                <div className="menu-info">
                  <h3 className="menu-title">Topics</h3>
                  <p className="menu-description">
                    Practice specific security topics and concepts
                  </p>
                  <p className="menu-status">
                    {availableTopics.size} topics available
                  </p>
                </div>
                <ChevronRight className="arrow-icon" />
              </div>
            </div>

            <div
              onClick={navigateToPracticeTests}
              className="menu-card practice-card"
            >
              <div className="menu-content">
                <FileText className="menu-icon" />
                <div className="menu-info">
                  <h3 className="menu-title">Practice Tests</h3>
                  <p className="menu-description">
                    Full-length practice exams to test your knowledge
                  </p>
                  <p className="menu-status">
                    {availablePracticeTests.size} tests available
                  </p>
                </div>
                <ChevronRight className="arrow-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "topics") {
    return (
      <div className="app">
        <div className="container">
          <div className="header">
            <button onClick={goHome} className="back-btn">
              <Home className="back-icon" />
              Back to Menu
            </button>
            <h1 className="main-title">Security Topics</h1>
            <p className="subtitle">Choose a topic to practice</p>
          </div>

          <div className="topics-grid">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => startQuiz(topic.id)}
                className={`topic-card ${
                  !availableTopics.has(topic.id) ? "disabled" : ""
                }`}
              >
                <div className="topic-content">
                  <div className="topic-info">
                    <h3 className="topic-title">{topic.title}</h3>
                    <p className="topic-status">
                      {availableTopics.has(topic.id)
                        ? "Available"
                        : "JSON file missing"}
                    </p>
                  </div>
                  <ChevronRight className="arrow-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "practice-tests") {
    return (
      <div className="app">
        <div className="container">
          <div className="header">
            <button onClick={goHome} className="back-btn">
              <Home className="back-icon" />
              Back to Menu
            </button>
            <h1 className="main-title">Practice Tests</h1>
            <p className="subtitle">Full-length practice exams</p>
          </div>

          <div className="topics-grid">
            {practiceTests.map((test) => (
              <div
                key={test.id}
                onClick={() => startQuiz(test.id)}
                className={`topic-card ${
                  !availablePracticeTests.has(test.id) ? "disabled" : ""
                }`}
              >
                <div className="topic-content">
                  <div className="topic-info">
                    <h3 className="topic-title">{test.title}</h3>
                    <p className="topic-status">
                      {availablePracticeTests.has(test.id)
                        ? "Available"
                        : "JSON file missing"}
                    </p>
                  </div>
                  <ChevronRight className="arrow-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "quiz") {
    const questions = selectedTopic.questions;
    const currentQ = questions[currentQuestion];

    if (showResults) {
      const score = calculateScore();
      const timeTaken = getTimeTaken();

      return (
        <div className="app">
          <div className="quiz-container">
            <div className="results-header">
              <h2 className="results-title">Quiz Complete!</h2>
              <h3 className="results-topic">{selectedTopic.title}</h3>
            </div>

            <div className="stats-container">
              <div className="stat-card score">
                <div className="stat-value">{score}%</div>
                <div className="stat-label">Final Score</div>
              </div>
              <div className="stat-card time">
                <div className="stat-value">{timeTaken}</div>
                <div className="stat-label">Time Taken</div>
              </div>
              <div className="stat-card correct">
                <div className="stat-value">
                  {userAnswers.reduce((count, answer, index) => {
                    const question = questions[index];
                    const isMultipleChoice = Array.isArray(question.correct);

                    if (isMultipleChoice) {
                      const userSelected = new Set(answer || []);
                      const correctSet = new Set(question.correct);

                      if (userSelected.size === correctSet.size) {
                        for (const correctIndex of correctSet) {
                          if (!userSelected.has(correctIndex)) {
                            return count;
                          }
                        }
                        return count + 1;
                      }
                      return count;
                    } else {
                      return answer === question.correct ? count + 1 : count;
                    }
                  }, 0)}
                  /{questions.length}
                </div>
                <div className="stat-label">Correct Answers</div>
              </div>
            </div>

            <div className="review-section">
              <h4 className="review-title">Question Review:</h4>
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const isMultipleChoice = Array.isArray(question.correct);

                let isCorrect = false;
                if (isMultipleChoice) {
                  const userSelected = new Set(userAnswer || []);
                  const correctSet = new Set(question.correct);

                  if (userSelected.size === correctSet.size) {
                    isCorrect = true;
                    for (const correctIndex of correctSet) {
                      if (!userSelected.has(correctIndex)) {
                        isCorrect = false;
                        break;
                      }
                    }
                  }
                } else {
                  isCorrect = userAnswer === question.correct;
                }

                return (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      {isCorrect ? (
                        <CheckCircle className="status-icon correct-icon" />
                      ) : (
                        <XCircle className="status-icon incorrect-icon" />
                      )}
                      <div className="review-content">
                        <p className="review-question">
                          {index + 1}. {question.question}
                          {isMultipleChoice && (
                            <span className="question-type-indicator">
                              (Select all that apply)
                            </span>
                          )}
                        </p>
                        <div className="options-grid">
                          {question.options.map((option, optIndex) => {
                            const isCorrectOption = isMultipleChoice
                              ? question.correct.includes(optIndex)
                              : optIndex === question.correct;
                            const isUserSelected = isMultipleChoice
                              ? (userAnswer || []).includes(optIndex)
                              : userAnswer === optIndex;

                            let optionClass = "neutral-option";
                            if (isCorrectOption) {
                              optionClass = "correct-option";
                            } else if (isUserSelected && !isCorrect) {
                              optionClass = "incorrect-option";
                            }

                            return (
                              <div
                                key={optIndex}
                                className={`option-review ${optionClass}`}
                              >
                                {option}
                              </div>
                            );
                          })}
                        </div>
                        <p className="explanation">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="action-buttons">
              <button onClick={restartQuiz} className="btn btn-primary">
                <RotateCcw className="btn-icon" />
                Retry Quiz
              </button>
              <button onClick={goHome} className="btn btn-secondary">
                <Home className="btn-icon" />
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app">
        <div className="quiz-container">
          <div className="quiz-header">
            <h2 className="quiz-title">{selectedTopic.title}</h2>
            <div className="quiz-info">
              <div className="question-counter">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <button onClick={goHome} className="home-btn">
                <Home className="home-icon" />
              </button>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="question-section">
            <h3 className="question-text">
              {currentQ.question}
              {Array.isArray(currentQ.correct) && (
                <span className="question-type-indicator">
                  (Select all that apply)
                </span>
              )}
            </h3>

            <div className="options-container">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`option-btn ${
                    isAnswerSelected(index) ? "selected" : ""
                  }`}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-actions">
            <button
              onClick={nextQuestion}
              disabled={!canProceed()}
              className={`next-btn ${canProceed() ? "enabled" : "disabled"}`}
            >
              {currentQuestion + 1 === questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
