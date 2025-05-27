import { PageContainer } from '@/components/ui/common/pageContainer'
import { PageHeader } from '@/components/ui/common/pageHeader'
import React from 'react'
import MentalHealthForm from './mentalHealthForm'
const mentalHealthPage = () => {
  return (
    <div className='bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950'>
        <PageContainer className='w-full'>
            <PageHeader
            title="Mental Wellness Check-in"
            description="Reflect on your thoughts and feelings."
            />
            <div className='max-w-3xl mx-auto mt-10'>
                <MentalHealthForm/>
            </div>
        </PageContainer>      
    </div>
  )
}

export default mentalHealthPage
