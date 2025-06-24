import React from 'react'
import { MdOutlineCancel, MdScience, MdEco } from 'react-icons/md'
import { BsCheck } from 'react-icons/bs'
import { FaLeaf, FaPalette } from 'react-icons/fa'
import { themeColors } from '../data/dummy'
import { useStateContext } from '../contexts/ContextProvider'
import { Tooltip } from 'react-tooltip'

const ThemeSettings = () => {
  const { setColor, setMode, currentMode, currentColor, setThemeSettings } = useStateContext()

  // Green Science themed colors
  const greenScienceColors = [
    { name: 'Emerald Green', color: '#10b981' },
    { name: 'Forest Green', color: '#059669' },
    { name: 'Dark Green', color: '#047857' },
    { name: 'Leaf Green', color: '#16a34a' },
    { name: 'Eco Blue', color: '#0891b2' },
    { name: 'Nature Teal', color: '#0d9488' },
    { name: 'Earth Brown', color: '#a16207' },
    { name: 'Sky Blue', color: '#0284c7' },
  ];

  return (
    <div className='bg-black/50 backdrop-blur-sm w-screen fixed nav-item top-0 right-0 z-50'>
      <div className='float-right h-screen bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l border-green-200 dark:border-gray-600 w-400 shadow-2xl'>
        
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-green-100 dark:border-gray-700'>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-full">
              <FaPalette className="text-white" />
            </div>
            <div>
              <p className='font-bold text-xl text-gray-800 dark:text-gray-200'>
                GreenSys Settings
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Customize your green experience
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => setThemeSettings(false)}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300'
          >
            <MdOutlineCancel className="text-2xl" />
          </button>
        </div>
        
        {/* Theme Mode Section */}
        <div className='p-6 border-b border-green-100 dark:border-gray-700'>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-500 p-1 rounded-full">
              <MdScience className="text-white text-sm" />
            </div>
            <p className='font-semibold text-lg text-gray-800 dark:text-gray-200'>
              Display Mode
            </p>
          </div>

          <div className='space-y-3'>
            <label className='flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-all duration-300'>
              <input
                type='radio'
                id='light'
                name='theme'
                value='Light'
                className='w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer'
                onChange={setMode}
                checked={currentMode === 'Light'}
              />
              <div className="flex items-center gap-2">
                <span className='text-md font-medium text-gray-700 dark:text-gray-300'>
                  Light Mode
                </span>
                <FaLeaf className="text-green-500 text-sm" />
              </div>
            </label>

            <label className='flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-all duration-300'>
              <input
                type='radio'
                id='dark'
                name='theme'
                value='Dark'
                className='w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer'
                onChange={setMode}
                checked={currentMode === 'Dark'}
              />
              <div className="flex items-center gap-2">
                <span className='text-md font-medium text-gray-700 dark:text-gray-300'>
                  Dark Mode
                </span>
                <MdEco className="text-emerald-500 text-sm" />
              </div>
            </label>
          </div>
        </div>

        {/* Green Science Theme Colors */}
        <div className='p-6 border-b border-green-100 dark:border-gray-700'>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-500 p-1 rounded-full">
              <FaPalette className="text-white text-sm" />
            </div>
            <p className='font-semibold text-lg text-gray-800 dark:text-gray-200'>
              Green Science Colors
            </p>
          </div>
          
          <div className='grid grid-cols-4 gap-3'>
            {greenScienceColors.map((item, index) => (
              <div key={index} className='relative cursor-pointer'>
                <button
                  type='button'
                  className='h-12 w-12 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-2 border-white dark:border-gray-700'
                  style={{ backgroundColor: item.color }}
                  onClick={() => setColor(item.color)}
                  data-tooltip-id={`green-tooltip-${index}`}
                  data-tooltip-content={item.name}
                >
                  <BsCheck 
                    className={`ml-2 text-2xl text-white ${item.color === currentColor ? 'block' : 'hidden'}`} 
                  />
                </button>
                <Tooltip id={`green-tooltip-${index}`} place="top" className="bg-gray-800 text-white text-xs px-2 py-1 rounded" />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FaLeaf className="text-green-500" />
              Choose colors that represent nature and sustainability
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings