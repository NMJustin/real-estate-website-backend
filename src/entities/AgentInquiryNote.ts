import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('agent_inquiry_notes')
@Unique(['agentId', 'inquiryId'])
export class AgentInquiryNote {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'agent_id' })
  agentId: string;

  @Column('text', { name: 'inquiry_id' })
  inquiryId: string;

  @Column('text', { default: '' })
  notes: string;

  @Column('timestamp', { name: 'next_follow_up_date', nullable: true })
  nextFollowUpDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
