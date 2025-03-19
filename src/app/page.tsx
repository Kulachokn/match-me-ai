'use client';

import { useState } from 'react';

// move to separate file
type JobAnalysis = {
  position: string;
  required_skills: string[];
  nice_to_have: string[];
  education: string;
  experience: string;
};

export default function VacancyForm() {
  const [text, setText] = useState('');
  // const [response, setResponse] = useState('');
  const [response, setResponse] = useState<JobAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter the job description');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      // const data = await res.json();
      const data = await res.json();
      setResponse(data || 'Error occurred while processing');
      console.log(data);
    } catch (err) {
      setResponse(null);
      setError('Something went wrong. Please try again.');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Analyze Job Vacancy Description</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter job description here"
          rows={6}
          cols={50}
        />
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Analyze'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-bold">Job Analysis</h2>
          <p><strong>Position:</strong> {response.position}</p>
          <p><strong>Required Skills:</strong> {response.required_skills?.join(", ")}</p>
          <p><strong>Nice to Have:</strong> {response.nice_to_have?.join(", ")}</p>
          <p><strong>Education:</strong> {response.education}</p>
          <p><strong>Experience:</strong> {response.experience}</p>
        </div>
      )}
    </div>
  );
}
