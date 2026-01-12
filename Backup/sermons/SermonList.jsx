'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SermonCard from './SermonCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { sermonService } from '@/services/api/sermonService';

const SermonList = ({ limit, showViewAll = false }) => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSermons();
  }, [limit]);

  const fetchSermons = async () => {
    try {
      const data = await sermonService.getSermons({ limit });
      setSermons(data.sermons || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-600">Error loading sermons</div>;

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-8">
        {sermons.map(sermon => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
      {showViewAll && (
        <div className="text-center mt-12">
          <Link href="/sermons">
            <Button variant="primary" icon={ChevronRight}>
              View All Sermons
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SermonList;