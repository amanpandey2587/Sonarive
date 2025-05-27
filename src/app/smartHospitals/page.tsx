import React from 'react'
import { PageContainer } from '@/components/ui/common/pageContainer'
import { PageHeader } from '@/components/ui/common/pageHeader'
import { HospitalRecsForm } from './hospitalRecsForm'
const page = () => {
  return (
    <div className='bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950'>
    <PageContainer className='bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950'>
      <PageHeader
      title="Smart Hospital Recommendations"
      description="Get AI-powered hospital suggestions based on diagnosed conditions and simulated research."
      />
      <div className='max-w-3xl mx-auto mt-10'>
        <HospitalRecsForm/>
      </div>
      
    </PageContainer>
    </div>
  )
}

export default page
