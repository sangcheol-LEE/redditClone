import { Exclude, Expose } from "class-transformer";
import {  BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import BaseEntity from "./Entity"
import Post from "./Post";
import { User } from "./User";
import Vote from "./Vote";
import { makeId } from "../utils/helper";
@Entity("comments")

export default class Comment extends BaseEntity {
  @Index()
  @Column()
  indentifier: string

  @Column()
  body: string;

  @Column()
  username : string

  @ManyToOne(() => User)
  @JoinColumn({name: "username", referencedColumnName: "username"})
  user:User

  @Column()
  postId: number

  @ManyToOne(() => Post, (post) => post.comments, {nullable: false})
  post : Post

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.comment)
  votes: Vote[]

  protected userVote: number;

  setUserVote(user: User) {
    const index = this.votes?.findIndex(v => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @Expose() get voteScore(): number {
    const initialValue = 0;
    return this.votes?.reduce((previousValue, currentValue) =>
      previousValue + (currentValue.value || 0), initialValue
    )
  }

  @BeforeInsert()
  makeId() {
    this.indentifier = makeId(8)
  }
}