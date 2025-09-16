import { useState } from "react";
import CategoryModal from "../CategoryModal";

export type Series = { 
  image: string; 
  title: string;
  messageCount?: number;
};

interface SeriesCardProps {
  series: Series;
  categoryMessage: Message;
}

export default function SeriesCard({ series, categoryMessage }: SeriesCardProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { title, image, messageCount } = series;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        {/* Big thumbnail with all content inside */}
        <div className="relative h-64 w-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Series badge */}
          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Series
          </div>
          
          {/* Message count badge */}
          {/* {messageCount && (
            <div className="absolute top-4 left-4 bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
              {messageCount} messages
            </div>
          )}
           */}
          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2  transition-colors">
              {title}
            </h3>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CategoryModal
        message={categoryMessage}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
} 