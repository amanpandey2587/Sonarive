import React from 'react'
import { PageContainer } from '@/components/ui/common/pageContainer'
import { PageHeader } from '@/components/ui/common/pageHeader'
import { HospitalRecsForm } from './hospitalRecsForm'
const page = () => {
  return (
    <PageContainer>
      <PageHeader
      title="Smart Hospital Recommendations"
      description="Get AI-powered hospital suggestions based on diagnosed conditions and simulated research."
      />
      <div className='max-w-3xl mx-auto'>
        <HospitalRecsForm/>
      </div>
      
    </PageContainer>
  )
}

export default page
