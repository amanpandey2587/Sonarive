import React from 'react'
import { PageContainer } from '@/components/ui/common/pageContainer'
import {DrugInfoForm} from './drugInfoForm'
import { PageHeader } from '@/components/ui/common/pageHeader'

const DrugResearchPage = () => {
  return (
    <div className='bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950 gap-y-10'>
    <PageContainer className='w-full'>
      <PageHeader
      title="Drug Information & Research"
      description="Get AI-powered insights on medications,alternatives ,interactions, and more. "
      />
    <div className='max-w-3xl mx-auto mt-10'>
        <DrugInfoForm/>
    </div>
    </PageContainer>
    </div>
  )
}

export default DrugResearchPage
