'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MapPinIcon, CalendarIcon, UserGroupIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { Person, Location, Event, Journey } from '@/types';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Person | Location | Event | Journey | null;
  type: 'person' | 'location' | 'event' | 'journey';
}

export default function DetailModal({ isOpen, onClose, data, type }: DetailModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useSwipeGesture(
    {
      onSwipeDown: isMobile ? onClose : undefined,
      onSwipeRight: isMobile ? onClose : undefined,
    },
    {
      threshold: 50,
    }
  );
  if (!data) return null;

  const getTitle = () => {
    switch (type) {
      case 'person':
        const person = data as Person;
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
            {(person.nameHebrew || person.nameGreek) && (
              <p className="text-sm text-gray-500 mt-1">
                {person.nameHebrew && <span className="font-hebrew">{person.nameHebrew}</span>}
                {person.nameHebrew && person.nameGreek && ' • '}
                {person.nameGreek && <span className="font-greek">{person.nameGreek}</span>}
              </p>
            )}
          </div>
        );
      case 'location':
        const location = data as Location;
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{location.name}</h2>
            {(location.nameHebrew || location.nameGreek) && (
              <p className="text-sm text-gray-500 mt-1">
                {location.nameHebrew && <span className="font-hebrew">{location.nameHebrew}</span>}
                {location.nameHebrew && location.nameGreek && ' • '}
                {location.nameGreek && <span className="font-greek">{location.nameGreek}</span>}
              </p>
            )}
            {location.modernName && (
              <p className="text-sm text-gray-500">Modern: {location.modernName}</p>
            )}
          </div>
        );
      case 'event':
        const event = data as Event;
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            {event.year && (
              <p className="text-sm text-gray-500 mt-1">
                {event.year < 0 ? `${Math.abs(event.year)} BC` : `${event.year} AD`}
              </p>
            )}
          </div>
        );
      case 'journey':
        const journey = data as Journey;
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{journey.title}</h2>
            {journey.person && (
              <p className="text-sm text-gray-500 mt-1">by {journey.person.name}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getContent = () => {
    switch (type) {
      case 'person':
        const person = data as Person;
        return (
          <div className="space-y-6">
            {person.imageUrl && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={person.imageUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Period</h3>
                  <p className="text-base text-gray-900">
                    {person.testament === 'OLD' ? 'Old Testament' :
                     person.testament === 'NEW' ? 'New Testament' : 'Both Testaments'}
                  </p>
                </div>

                {(person.birthYear || person.deathYear) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lifespan</h3>
                    <p className="text-base text-gray-900">
                      {person.birthYear && (person.birthYear < 0 ? `${Math.abs(person.birthYear)} BC` : `${person.birthYear} AD`)}
                      {person.birthYear && person.deathYear && ' - '}
                      {person.deathYear && (person.deathYear < 0 ? `${Math.abs(person.deathYear)} BC` : `${person.deathYear} AD`)}
                    </p>
                  </div>
                )}

                {person.birthPlace && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Birth Place</h3>
                    <p className="text-base text-gray-900 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      {person.birthPlace.name}
                    </p>
                  </div>
                )}

                {person.deathPlace && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Death Place</h3>
                    <p className="text-base text-gray-900 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      {person.deathPlace.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {person.gender && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                    <p className="text-base text-gray-900 capitalize">{person.gender.toLowerCase()}</p>
                  </div>
                )}

                {person.timeline && person.timeline.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Key Events</h3>
                    <ul className="text-base text-gray-900 list-disc list-inside">
                      {person.timeline.map((event, idx) => (
                        <li key={idx}>{event}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-base text-gray-900">{person.description}</p>
            </div>

            {person.significance && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Significance</h3>
                <p className="text-base text-gray-900">{person.significance}</p>
              </div>
            )}

            {person.events && person.events.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Related Events</h3>
                <div className="space-y-2">
                  {person.events.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        {event.year && (
                          <p className="text-xs text-gray-500">
                            {event.year < 0 ? `${Math.abs(event.year)} BC` : `${event.year} AD`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {person.journeys && person.journeys.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Journeys</h3>
                <div className="space-y-2">
                  {person.journeys.map((journey) => (
                    <div key={journey.id} className="p-2 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-900">{journey.title}</p>
                      {journey.purpose && (
                        <p className="text-xs text-gray-500">{journey.purpose}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'location':
        const location = data as Location;
        return (
          <div className="space-y-6">
            {location.imageUrl && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={location.imageUrl}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Coordinates</h3>
                  <p className="text-base text-gray-900">
                    {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                  </p>
                </div>

                {location.country && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Country</h3>
                    <p className="text-base text-gray-900">{location.country}</p>
                  </div>
                )}

                {location.period && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Period</h3>
                    <p className="text-base text-gray-900">{location.period}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-base text-gray-900">{location.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Biblical Significance</h3>
              <p className="text-base text-gray-900">{location.significance}</p>
            </div>

            {location.events && location.events.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Events at this Location</h3>
                <div className="space-y-2">
                  {location.events.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {location.birthPersons && location.birthPersons.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Born Here</h3>
                <div className="flex flex-wrap gap-2">
                  {location.birthPersons.map((person) => (
                    <span key={person.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      {person.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'event':
        const event = data as Event;
        return (
          <div className="space-y-6">
            {event.imageUrl && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="text-base text-gray-900 capitalize">
                    {event.category.toLowerCase().replace('_', ' ')}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Testament</h3>
                  <p className="text-base text-gray-900">
                    {event.testament === 'OLD' ? 'Old Testament' : 'New Testament'}
                  </p>
                </div>

                {event.yearRange && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Range</h3>
                    <p className="text-base text-gray-900">{event.yearRange}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {event.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-base text-gray-900 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      {event.location.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-base text-gray-900">{event.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Significance</h3>
              <p className="text-base text-gray-900">{event.significance}</p>
            </div>

            {event.persons && event.persons.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">People Involved</h3>
                <div className="flex flex-wrap gap-2">
                  {event.persons.map((person) => (
                    <div key={person.id} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <UserGroupIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{person.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'journey':
        const journey = data as Journey;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {journey.year && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Year</h3>
                    <p className="text-base text-gray-900">
                      {journey.year < 0 ? `${Math.abs(journey.year)} BC` : `${journey.year} AD`}
                    </p>
                  </div>
                )}

                {journey.duration && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="text-base text-gray-900">{journey.duration} days</p>
                  </div>
                )}

                {journey.distance && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Distance</h3>
                    <p className="text-base text-gray-900">{journey.distance} km</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-base text-gray-900">{journey.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Purpose</h3>
              <p className="text-base text-gray-900">{journey.purpose}</p>
            </div>

            {journey.stops && journey.stops.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Journey Stops</h3>
                <div className="space-y-3">
                  {journey.stops.map((stop, index) => (
                    <div key={stop.order} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {stop.location?.name || 'Unknown Location'}
                        </p>
                        {stop.description && (
                          <p className="text-xs text-gray-500 mt-1">{stop.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {isMobile && (
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-12 h-1 bg-gray-300 rounded-full" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Dialog.Title as="div">
                      {getTitle()}
                    </Dialog.Title>
                    <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                  {getContent()}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      // TODO: Navigate to detail page or map
                      onClose();
                    }}
                  >
                    <MapPinIcon className="h-4 w-4" />
                    View on Map
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}