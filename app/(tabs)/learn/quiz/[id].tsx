import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../components/AuthContext';
import { CircleCheck as CheckCircle, Circle as XCircle, ArrowRight, Award } from 'lucide-react-native';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  module_id: string;
  points: number;
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  useEffect(() => {
    loadQuiz();
  }, [id]);
  
  const loadQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || quizCompleted) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (currentQuestion && answerIndex === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };
  
  const nextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };
  
  const completeQuiz = async () => {
    if (!quiz || !user) return;
    
    setQuizCompleted(true);
    
    try {
      const finalScore = Math.round((score / quiz.questions.length) * 100);
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: quiz.module_id,
          quiz_scores: {
            [id]: finalScore
          },
          last_accessed: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Award points if score is above 70%
      if (finalScore >= 70) {
        await supabase
          .from('achievements')
          .insert({
            user_id: user.id,
            title: quiz.title,
            description: `Completed ${quiz.title} with ${finalScore}% score`,
            points: quiz.points,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      Alert.alert('Error', 'Failed to save quiz results');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }
  
  if (error || !quiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Quiz not found'}</Text>
      </View>
    );
  }
  
  if (quizCompleted) {
    const finalScore = Math.round((score / quiz.questions.length) * 100);
    const passed = finalScore >= 70;
    
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          {passed ? (
            <Award size={64} color="#10B981" style={styles.resultIcon} />
          ) : (
            <XCircle size={64} color="#EF4444" style={styles.resultIcon} />
          )}
          
          <Text style={styles.resultTitle}>
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </Text>
          
          <Text style={styles.resultScore}>
            Your Score: {finalScore}%
          </Text>
          
          <Text style={styles.resultText}>
            {passed 
              ? `You've earned ${quiz.points} points!` 
              : 'Try again to earn points'}
          </Text>
          
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={() => router.back()}
          >
            <Text style={styles.returnButtonText}>Return to Module</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedAnswer === index && (
                  index === currentQuestion.correct_answer
                    ? styles.correctOption
                    : styles.incorrectOption
                )
              ]}
              onPress={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
              
              {selectedAnswer === index && (
                index === currentQuestion.correct_answer
                  ? <CheckCircle size={20} color="#10B981" />
                  : <XCircle size={20} color="#EF4444" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {showExplanation && (
          <View style={styles.explanation}>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {selectedAnswer !== null && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
  },
  options: {
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    marginRight: 12,
  },
  selectedOptionText: {
    fontWeight: '500',
  },
  explanation: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 24,
  },
  explanationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultIcon: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 32,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});