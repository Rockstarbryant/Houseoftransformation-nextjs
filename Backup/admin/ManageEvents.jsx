import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { eventService } from '../../services/api/eventService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(formData);
      alert('Event added successfully!');
      setShowForm(false);
      setFormData({ title: '', description: '', date: '', time: '', location: '', image: '' });
      fetchEvents();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        alert('Event deleted!');
        fetchEvents();
      } catch (error) {
        alert('Error deleting event');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Manage Events</h1>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          Add New Event
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              label="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                rows="4"
              />
            </div>
            <Input
              name="date"
              type="date"
              label="Event Date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input
              name="time"
              label="Event Time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              placeholder="e.g., 9:00 AM - 12:00 PM"
              required
            />
            <Input
              name="location"
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
            <Input
              name="image"
              label="Image URL (optional)"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://..."
            />
            <div className="flex gap-4">
              <Button type="submit" variant="primary">Add Event</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event._id || event.id} hover>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-blue-900 text-white rounded-lg p-4 text-center min-w-[80px]">
                  <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                  <p className="text-sm">{new Date(event.date).toLocaleString('default', { month: 'short' })}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{event.title}</h3>
                  <p className="text-gray-600">{event.time}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-900 hover:bg-blue-50 rounded">
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(event._id || event.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;