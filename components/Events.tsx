import React, { useState, useMemo, useCallback } from 'react';
import { Event } from '../types';
import Card from './Card';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from './Icons';

// --- Helper Functions ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- Sub-components ---
const EventForm: React.FC<{
    event: Partial<Event> | null;
    onSave: (eventData: Omit<Event, 'id'> | Event) => void;
    onClose: () => void;
}> = ({ event, onSave, onClose }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
    const [photos, setPhotos] = useState<string[]>(event?.photos || []);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filePromises = Array.from(e.target.files).map(fileToBase64);
            const base64Photos = await Promise.all(filePromises);
            setPhotos(prev => [...prev, ...base64Photos]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;
        const eventData = { id: event?.id || '', title, description, date, photos };
        onSave(eventData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{event?.id ? 'Edit' : 'Create'} Event</h2>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title" className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." rows={3} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photos</label>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-cyan-900/50 dark:file:text-cyan-300 dark:hover:file:bg-cyan-800/50"/>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img src={photo} alt={`upload-preview-${index}`} className="w-full h-24 object-cover rounded-md" />
                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <XIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-lg py-2">Cancel</button>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg py-2">{event?.id ? 'Save Changes' : 'Create Event'}</button>
            </div>
        </form>
    );
};

const GalleryModal: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextPhoto = () => setCurrentIndex(prev => (prev + 1) % event.photos.length);
    const prevPhoto = () => setCurrentIndex(prev => (prev - 1 + event.photos.length) % event.photos.length);

    if (event.photos.length === 0) {
       return (
         <Modal onClose={onClose}>
            <div className="p-4">
                <h3 className="text-2xl font-bold font-display">{event.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                <p>No photos for this event.</p>
            </div>
         </Modal>
       )
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="relative w-full max-w-3xl h-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-8 right-0 text-white hover:text-slate-300 z-10"><XIcon /></button>
                <div className="relative flex-grow bg-black rounded-t-lg flex items-center justify-center">
                    <img src={event.photos[currentIndex]} alt={`${event.title} photo ${currentIndex + 1}`} className="max-h-full max-w-full object-contain"/>
                    {event.photos.length > 1 && <>
                        <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"><ChevronLeftIcon /></button>
                        <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70"><ChevronRightIcon /></button>
                    </>}
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold font-display">{event.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })} ({currentIndex + 1}/{event.photos.length})</p>
                    <p className="text-sm max-h-20 overflow-y-auto">{event.description}</p>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface EventsProps {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const Events: React.FC<EventsProps> = ({ events, setEvents }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [galleryEvent, setGalleryEvent] = useState<Event | null>(null);

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);

    const handleSaveEvent = (eventData: Omit<Event, 'id'> | Event) => {
        if ('id' in eventData && eventData.id) { // Editing
            setEvents(events.map(e => e.id === eventData.id ? eventData : e));
        } else { // Creating
            setEvents([...events, { ...eventData, id: new Date().toISOString() }]);
        }
        setIsFormModalOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (id: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(e => e.id !== id));
        }
    };

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const filteredEvents = useMemo(() => {
        if (!selectedDate) return [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return eventsByDate[selectedDate] || [];
    }, [events, selectedDate, eventsByDate]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card title="Calendar">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)}><ChevronLeftIcon /></button>
                        <h3 className="font-semibold font-display text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => changeMonth(1)}><ChevronRightIcon /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {monthDays.map(day => {
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const hasEvent = !!eventsByDate[dateStr];
                            const isSelected = selectedDate === dateStr;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                    className={`relative h-9 w-9 rounded-full transition-colors flex items-center justify-center
                                        ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
                                    `}
                                >
                                    {day}
                                    {hasEvent && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></span>}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card title={selectedDate ? `Events on ${new Date(selectedDate).toLocaleDateString(undefined, {dateStyle: 'medium'})}` : "All Events"} headerContent={
                    <button onClick={() => { setEditingEvent(null); setIsFormModalOpen(true);}} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white transition-colors">
                        <PlusIcon />
                    </button>
                }>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {filteredEvents.length === 0 && <p className="text-center text-slate-500 py-10">No events to show.</p>}
                        {filteredEvents.map(event => (
                            <div key={event.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{event.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{new Date(event.date).toLocaleDateString(undefined, {dateStyle: 'full'})}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{event.description}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-2">
                                        <button onClick={() => {setEditingEvent(event); setIsFormModalOpen(true);}} className="text-slate-500 hover:text-blue-500"><PencilIcon /></button>
                                        <button onClick={() => handleDeleteEvent(event.id)} className="text-slate-500 hover:text-rose-500"><TrashIcon /></button>
                                    </div>
                                </div>
                                {event.photos.length > 0 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto">
                                        {event.photos.slice(0, 4).map((photo, idx) => (
                                            <img key={idx} src={photo} onClick={() => setGalleryEvent(event)} alt={event.title} className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-80"/>
                                        ))}
                                    </div>
                                )}
                                 <button onClick={() => setGalleryEvent(event)} className="mt-3 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
                                    View Gallery {event.photos.length > 0 && `(${event.photos.length})`}
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {isFormModalOpen && (
                <Modal onClose={() => setIsFormModalOpen(false)}>
                    <EventForm event={editingEvent} onSave={handleSaveEvent} onClose={() => setIsFormModalOpen(false)} />
                </Modal>
            )}

            {galleryEvent && (
                <GalleryModal event={galleryEvent} onClose={() => setGalleryEvent(null)} />
            )}
        </div>
    );
};

export default Events;
