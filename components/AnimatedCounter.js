'use client';

import CountUp from 'react-countup';

const AnimatedCounter = ({ amount }) => {
  return (
    <div className="w-full">
      <CountUp 
        decimals={2}
        prefix='₹'
        end={amount} 
      />
    </div>
  )
}

export default AnimatedCounter